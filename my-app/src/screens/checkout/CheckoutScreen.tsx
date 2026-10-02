import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listAddresses } from "@/api/addresses";
import { getCart } from "@/services/cartService";
import { ApiError } from "@/api/client";
import { createOrder } from "@/api/orders";
import { verifyPayment } from "@/api/payments";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { requireAuth } from "@/navigation/authRedirect";
import { getSelectedAddressId } from "@/storage/addressStorage";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FooterBar } from "@/components/FooterBar";
import { Loading } from "@/components/Loading";
import { RazorpayCheckoutModal } from "@/components/RazorpayCheckoutModal";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Address, Cart, CartLineItem, CreatedOrder } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Checkout">;

const STOCK_MESSAGE =
  "One or more items are no longer available in the requested quantity. Please review your cart.";

const mapOrderError = (err: unknown): string => {
  if (!(err instanceof ApiError)) {
    return "Unable to place your order. Please try again.";
  }

  const payload = err.data;
  const raw =
    typeof payload === "object" && payload !== null && "message" in payload
      ? String((payload as { message?: unknown }).message ?? "")
      : "";
  const combined = `${err.message} ${raw}`.toLowerCase();

  if (combined.includes("insufficient stock") || combined.includes("not available")) {
    return STOCK_MESSAGE;
  }
  if (err.status === 404) {
    return "That address is no longer available. Please pick another.";
  }
  if (combined.includes("payment verification failed")) {
    return "Payment could not be verified. Please try again from Orders.";
  }
  return err.message;
};

const unitPrice = (item: CartLineItem): number => {
  return item.product.discountPrice ?? item.product.price;
};

const razorpayContact = (phone: string | undefined): string | undefined => {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  const ten = digits.length >= 10 ? digits.slice(-10) : digits;
  return ten.length === 10 ? ten : undefined;
};

export function CheckoutScreen({ navigation, route }: Props) {
  const { isAuthenticated, user } = useAuth();
  const { refreshCart } = useCart();
  const routeAddressId = route.params?.selectedAddressId;
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(routeAddressId);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [payOrder, setPayOrder] = useState<CreatedOrder | null>(null);

  const loadCart = useCallback(async () => {
    setCartError(null);
    try {
      setCart(await getCart());
    } catch (err) {
      setCartError(err instanceof ApiError ? err.message : "Unable to load your cart.");
    }
  }, []);

  const loadAddresses = useCallback(async () => {
    setAddressError(null);
    try {
      const next = await listAddresses();
      setAddresses(next);
      const stored = await getSelectedAddressId();
      setSelectedAddressId((current) => {
        const preferred = routeAddressId ?? stored ?? current;
        if (preferred && next.some((address) => address.id === preferred)) {
          return preferred;
        }
        return next[0]?.id;
      });
    } catch (err) {
      setAddressError(err instanceof ApiError ? err.message : "Unable to load addresses.");
    }
  }, [routeAddressId]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        navigation.replace("Login", { redirect: "Checkout" });
        return;
      }

      let cancelled = false;

      const run = async () => {
        setCartError(null);
        setAddressError(null);
        try {
          const [cartResult, addressResult] = await Promise.all([
            getCart()
              .then((data) => ({ ok: true as const, data }))
              .catch((err: unknown) => ({ ok: false as const, err })),
            listAddresses()
              .then((data) => ({ ok: true as const, data }))
              .catch((err: unknown) => ({ ok: false as const, err })),
          ]);

          if (cancelled) return;

          if (cartResult.ok) {
            setCart(cartResult.data);
          } else {
            setCartError(
              cartResult.err instanceof ApiError ? cartResult.err.message : "Unable to load your cart.",
            );
          }

          if (addressResult.ok) {
            const next = addressResult.data;
            setAddresses(next);
            const stored = await getSelectedAddressId();
            setSelectedAddressId((current) => {
              const preferred = routeAddressId ?? stored ?? current;
              if (preferred && next.some((address) => address.id === preferred)) {
                return preferred;
              }
              return next[0]?.id;
            });
          } else {
            setAddressError(
              addressResult.err instanceof ApiError
                ? addressResult.err.message
                : "Unable to load addresses.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      void run();
      return () => {
        cancelled = true;
      };
    }, [isAuthenticated, navigation, routeAddressId]),
  );

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const items = cart?.items ?? [];
  const isEmptyCart = !loading && !cartError && items.length === 0;
  const canReview = !loading && !cartError && !addressError && items.length > 0;
  const hasAddressSection = canReview;
  const noAddresses = hasAddressSection && addresses.length === 0;
  const canPlaceOrder = canReview && Boolean(selectedAddress) && !submitting;

  const goShopping = () => {
    navigation.navigate("MainTabs", { screen: "Home" });
  };

  const onPlaceOrder = async () => {
    if (!requireAuth(navigation, isAuthenticated, "Checkout")) return;
    if (submitting || submittingRef.current) return;
    if (!cart || cart.items.length === 0) {
      setSubmitError("Your cart is empty. Add items before placing an order.");
      return;
    }
    if (!selectedAddressId) {
      setSubmitError("Add a delivery address to place your order.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder(selectedAddressId);
      await refreshCart();
      if (!order.razorpay) {
        setSubmitError("Unable to start payment. Your order is saved under Orders.");
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }
      setPayOrder(order);
    } catch (err) {
      setSubmitError(mapOrderError(err));
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const closePayment = () => {
    setPayOrder(null);
    submittingRef.current = false;
    setSubmitting(false);
  };

  const onPaymentSuccess = async (result: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    if (!payOrder) return;
    try {
      const paid = await verifyPayment({
        orderId: payOrder.id,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });
      closePayment();
      navigation.replace("OrderConfirmation", { order: paid });
    } catch (err) {
      closePayment();
      setSubmitError(mapOrderError(err));
    }
  };

  return (
    <View style={styles.host}>
      <Screen
        footer={
          canReview && selectedAddress ? (
            <FooterBar>
              <View>
                <Text style={styles.barLabel}>Total</Text>
                <Text style={styles.barValue}>₹{cart?.subtotal ?? 0}</Text>
              </View>
              <View style={styles.barAction}>
                <Button
                  title="PLACE ORDER"
                  onPress={() => void onPlaceOrder()}
                  loading={submitting}
                  disabled={!canPlaceOrder}
                />
              </View>
            </FooterBar>
          ) : null
        }
      >
      <Text style={styles.title}>Checkout</Text>

      {loading ? <Loading /> : null}

      {cartError ? <ErrorMessage message={cartError} onRetry={() => void loadCart()} /> : null}
      {addressError ? <ErrorMessage message={addressError} onRetry={() => void loadAddresses()} /> : null}

      {isEmptyCart ? (
        <View style={styles.empty}>
          <EmptyState
            centered
            title="Your cart is empty"
            description="Add some products before placing an order."
          />
          <Button title="Continue Shopping" onPress={goShopping} />
        </View>
      ) : null}

      {noAddresses ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <EmptyState
            title="No delivery address"
            description="Add an address to continue with your order."
          />
          <Button title="Add Address" onPress={() => navigation.navigate("AddAddress")} />
        </View>
      ) : null}

      {hasAddressSection && selectedAddress ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Card>
            <Text style={styles.addressLine}>{selectedAddress.addressLine}</Text>
            <Text style={styles.addressMeta}>
              {selectedAddress.city} - {selectedAddress.pincode}
            </Text>
            <Button
              title="Change"
              variant="ghost"
              onPress={() =>
                navigation.navigate("AddressList", {
                  selectForCheckout: true,
                  selectedAddressId: selectedAddress.id,
                })
              }
            />
          </Card>
        </View>
      ) : null}

      {canReview ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.reviewRow}>
              <View style={styles.reviewCopy}>
                <Text style={styles.reviewName}>{item.product.name}</Text>
                <Text style={styles.reviewMeta}>
                  ₹{unitPrice(item)} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.reviewTotal}>₹{item.lineTotal}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{cart?.subtotal ?? 0}</Text>
          </View>
        </View>
      ) : null}

      {submitError ? <ErrorMessage message={submitError} /> : null}
      </Screen>
      <RazorpayCheckoutModal
        visible={Boolean(payOrder?.razorpay)}
        checkout={payOrder?.razorpay ?? null}
        prefill={{
          name: user?.name,
          email: user?.email,
          contact: razorpayContact(user?.phone),
        }}
        onSuccess={(result) => void onPaymentSuccess(result)}
        onCancel={() => {
          closePayment();
          setSubmitError("Payment was cancelled. Your order is saved under Orders with pending payment.");
        }}
        onFailed={(message) => {
          closePayment();
          setSubmitError(message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.medium,
    color: theme.colors.text,
  },
  addressLine: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  addressMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  reviewCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  reviewName: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  reviewMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  reviewTotal: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.typography.subheading,
    color: theme.colors.text,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: theme.typography.heading,
    color: theme.colors.primary,
    fontWeight: theme.weight.bold,
  },
  barLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  barValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading,
    fontWeight: "700",
  },
  barAction: {
    flex: 1,
    maxWidth: 220,
  },
});
