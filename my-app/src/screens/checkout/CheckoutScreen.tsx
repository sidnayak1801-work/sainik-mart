import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listAddresses } from "@/api/addresses";
import { getCart } from "@/api/cart";
import { ApiError } from "@/api/client";
import { createOrder } from "@/api/orders";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Address, Cart, CartLineItem } from "@/types/models";
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
  return err.message;
};

const unitPrice = (item: CartLineItem): number => {
  return item.product.discountPrice ?? item.product.price;
};

export function CheckoutScreen({ navigation, route }: Props) {
  const routeAddressId = route.params?.selectedAddressId;
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(routeAddressId);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setSelectedAddressId((current) => {
        const preferred = routeAddressId ?? current;
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
            setSelectedAddressId((current) => {
              const preferred = routeAddressId ?? current;
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
    }, [routeAddressId]),
  );

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const items = cart?.items ?? [];
  const isEmptyCart = !loading && !cartError && items.length === 0;
  const canReview = !loading && !cartError && items.length > 0;
  const hasAddressSection = canReview && !addressError;
  const noAddresses = hasAddressSection && addresses.length === 0;
  const canPlaceOrder = canReview && Boolean(selectedAddress) && !submitting;

  const goShopping = () => {
    navigation.navigate("MainTabs", { screen: "Home" });
  };

  const onPlaceOrder = async () => {
    if (submitting) return;
    if (!cart || cart.items.length === 0) {
      setSubmitError("Your cart is empty. Add items before placing an order.");
      return;
    }
    if (!selectedAddressId) {
      setSubmitError("Add a delivery address to place your order.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder(selectedAddressId);
      navigation.replace("OrderConfirmation", { order });
    } catch (err) {
      setSubmitError(mapOrderError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
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
          <View style={styles.addressCard}>
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
          </View>
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

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      {canReview && selectedAddress ? (
        <Button
          title="PLACE ORDER"
          onPress={() => void onPlaceOrder()}
          loading={submitting}
          disabled={!canPlaceOrder}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "700",
    color: theme.colors.text,
  },
  addressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    fontWeight: "700",
  },
  submitError: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
  },
});
