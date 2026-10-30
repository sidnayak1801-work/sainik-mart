import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ApiError } from "@/api/client";
import { QtyStepper } from "@/components/QtyStepper";
import { useCart } from "@/context/CartContext";
import { setProductQuantity } from "@/services/cartService";
import { theme } from "@/theme";
import type { Product } from "@/types/models";

type CartQtyControlsProps = {
  product: Product;
  compact?: boolean;
};

export function CartQtyControls({ product, compact = false }: CartQtyControlsProps) {
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
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {quantity <= 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
          onPress={() => void changeTo(1)}
          disabled={busy || outOfStock}
          style={[
            styles.addButton,
            compact && styles.addButtonCompact,
            (busy || outOfStock) && styles.disabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={theme.colors.primaryText} size="small" />
          ) : (
            <Text style={[styles.addLabel, compact && styles.addLabelCompact]}>
              {outOfStock ? (compact ? "Sold" : "Out of stock") : compact ? "ADD" : "Add to cart"}
            </Text>
          )}
        </Pressable>
      ) : (
        <QtyStepper
          compact={compact}
          quantity={quantity}
          onDecrease={() => void changeTo(quantity - 1)}
          onIncrease={() => void changeTo(quantity + 1)}
          increaseDisabled={atCeiling}
          busy={busy}
        />
      )}
      {error ? (
        <Text style={styles.error} numberOfLines={compact ? 1 : undefined}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  wrapCompact: {
    alignSelf: "flex-end",
    minWidth: 88,
    maxWidth: 110,
    gap: 2,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  addButtonCompact: {
    minHeight: 32,
    minWidth: 64,
    paddingHorizontal: theme.spacing.sm,
  },
  addLabel: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
  },
  addLabelCompact: {
    fontSize: theme.typography.caption,
  },
  disabled: {
    opacity: 0.65,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
