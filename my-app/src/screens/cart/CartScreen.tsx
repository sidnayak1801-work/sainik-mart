import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { deleteCartItem, getCart, updateCartItem } from "@/services/cartService";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button";
import { CartItemRow } from "@/components/CartItemRow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FooterBar } from "@/components/FooterBar";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { requireAuth } from "@/navigation/authRedirect";
import { theme } from "@/theme";
import type { Cart, CartLineItem } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Cart">,
  NativeStackScreenProps<MainStackParamList>
>;

export function CartScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
  const { applyCart } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const next = await getCart();
      setCart(next);
      applyCart(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load your cart.");
    }
  }, [applyCart]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        setError(null);
        try {
          const next = await getCart();
          if (!cancelled) {
            setCart(next);
            applyCart(next);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof ApiError ? err.message : "Unable to load your cart.");
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
    }, [applyCart]),
  );

  const mutate = async (itemId: string, action: () => Promise<Cart>) => {
    if (updatingItemId) return;
    setUpdatingItemId(itemId);
    setError(null);
    try {
      const next = await action();
      setCart(next);
      applyCart(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update your cart.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const onIncrease = (item: CartLineItem) => {
    if (item.quantity >= item.product.stockQuantity) return;
    void mutate(item.id, () => updateCartItem(item.id, item.quantity + 1));
  };

  const onDecrease = (item: CartLineItem) => {
    if (item.quantity <= 1) {
      void mutate(item.id, () => deleteCartItem(item.id));
      return;
    }
    void mutate(item.id, () => updateCartItem(item.id, item.quantity - 1));
  };

  const onRemove = (item: CartLineItem) => {
    void mutate(item.id, () => deleteCartItem(item.id));
  };

  const goShopping = () => {
    navigation.navigate("Home");
  };

  const goCheckout = () => {
    if (!requireAuth(navigation, isAuthenticated, "Checkout")) return;
    navigation.navigate("Checkout");
  };

  const goAddresses = () => {
    if (!requireAuth(navigation, isAuthenticated, "AddressList")) return;
    navigation.navigate("AddressList");
  };

  const items = cart?.items ?? [];
  const isEmpty = !loading && !error && items.length === 0;

  return (
    <Screen
      scroll={false}
      footer={
        !loading && items.length > 0 ? (
          <FooterBar>
            <View>
              <Text style={styles.barLabel}>Subtotal</Text>
              <Text style={styles.barValue}>₹{cart?.subtotal ?? 0}</Text>
            </View>
            <View style={styles.barAction}>
              <Button title="Proceed to Checkout" onPress={goCheckout} />
            </View>
          </FooterBar>
        ) : null
      }
    >
      <Text style={styles.title}>My Cart</Text>
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
      {isEmpty ? (
        <View style={styles.empty}>
          <EmptyState
            centered
            title="Your cart is empty"
            description="Add some products to your cart"
          />
          <Button title="Continue Shopping" onPress={goShopping} />
          <Button title="Delivery addresses" onPress={goAddresses} variant="ghost" />
        </View>
      ) : null}
      {!loading && items.length > 0 ? (
        <FlatList
          style={styles.listFlex}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartItemRow
              item={item}
              disabled={updatingItemId === item.id}
              onIncrease={() => onIncrease(item)}
              onDecrease={() => onDecrease(item)}
              onRemove={() => onRemove(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <View style={styles.secondary}>
              <Button title="Continue Shopping" onPress={goShopping} variant="ghost" />
              <Button title="Delivery addresses" onPress={goAddresses} variant="ghost" />
            </View>
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.title,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  secondary: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  barLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  barValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.bold,
  },
  barAction: {
    flex: 1,
    maxWidth: 220,
  },
});
