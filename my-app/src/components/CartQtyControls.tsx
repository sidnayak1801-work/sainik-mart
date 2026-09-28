import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ApiError } from "@/api/client";
import { useCart } from "@/context/CartContext";
import { setProductQuantity } from "@/services/cartService";
import { theme } from "@/theme";
import type { Product } from "@/types/models";

type CartQtyControlsProps = {
  product: Product;
};

export function CartQtyControls({ product }: CartQtyControlsProps) {
  const { cart, quantityFor, applyCart } = useCart();
  const quantity = quantityFor(product.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stock = product.stockQuantity;
  const outOfStock = stock !== undefined && stock <= 0;
  const atCeiling = stock !== undefined && quantity >= stock;

  const changeTo = async (next: number) => {
    if (busy) return;
    if (next > 0 && stock !== undefined && next > stock) return;
    setError(null);
    setBusy(true);
    try {
      applyCart(await setProductQuantity(product.id, next, cart));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update your cart.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {quantity <= 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
          onPress={() => void changeTo(1)}
          disabled={busy || outOfStock}
          style={[styles.addButton, (busy || outOfStock) && styles.disabled]}
        >
          {busy ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text style={styles.addLabel}>{outOfStock ? "Out of stock" : "Add to cart"}</Text>
          )}
        </Pressable>
      ) : (
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
            onPress={() => void changeTo(quantity - 1)}
            disabled={busy}
            style={styles.stepButton}
          >
            <Text style={styles.stepLabel}>−</Text>
          </Pressable>
          <View style={styles.qtyWrap}>
            {busy ? (
              <ActivityIndicator color={theme.colors.primaryText} />
            ) : (
              <Text style={styles.qty}>{quantity}</Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
            onPress={() => void changeTo(quantity + 1)}
            disabled={busy || atCeiling}
            style={[styles.stepButton, atCeiling && styles.disabled]}
          >
            <Text style={styles.stepLabel}>+</Text>
          </Pressable>
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  addLabel: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    minHeight: 48,
    paddingHorizontal: theme.spacing.sm,
  },
  stepButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    color: theme.colors.primaryText,
    fontSize: 22,
    fontWeight: "700",
  },
  qtyWrap: {
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.subheading,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
