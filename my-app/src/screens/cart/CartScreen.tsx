import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { deleteCartItem, getCart, updateCartItem } from "@/api/cart";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button";
import { CartItemRow } from "@/components/CartItemRow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Cart, CartLineItem } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Cart">,
  NativeStackScreenProps<MainStackParamList>
>;

export function CartScreen({ navigation }: Props) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCart(await getCart());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load your cart.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        setError(null);
        try {
          const next = await getCart();
          if (!cancelled) {
            setCart(next);
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
    }, []),
  );

  const mutate = async (itemId: string, action: () => Promise<Cart>) => {
    if (updatingItemId) return;
    setUpdatingItemId(itemId);
    setError(null);
    try {
      setCart(await action());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update your cart.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const onIncrease = (item: CartLineItem) => {
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

  const items = cart?.items ?? [];
  const isEmpty = !loading && !error && items.length === 0;

  return (
    <Screen scroll={false}>
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
          <Button title="Delivery addresses" onPress={() => navigation.navigate("AddressList")} />
          <Button title="Continue Shopping" onPress={goShopping} />
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
            <View style={styles.footer}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>₹{cart?.subtotal ?? 0}</Text>
              </View>
              <Button title="Proceed to Checkout" onPress={() => navigation.navigate("Checkout")} />
              <Button title="Delivery addresses" onPress={() => navigation.navigate("AddressList")} />
              <Button title="Continue Shopping" onPress={goShopping} />
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
    fontWeight: "700",
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
  footer: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtotalLabel: {
    fontSize: theme.typography.subheading,
    color: theme.colors.text,
    fontWeight: "600",
  },
  subtotalValue: {
    fontSize: theme.typography.heading,
    color: theme.colors.primary,
    fontWeight: "700",
  },
});
