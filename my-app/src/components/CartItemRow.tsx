import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { CartLineItem } from "@/types/models";

type CartItemRowProps = {
  item: CartLineItem;
  disabled?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

const unitPrice = (item: CartLineItem): number => {
  return item.product.discountPrice ?? item.product.price;
};

export function CartItemRow({ item, disabled = false, onIncrease, onDecrease, onRemove }: CartItemRowProps) {
  return (
    <View style={[styles.card, disabled ? styles.disabled : null]}>
      {item.product.imageUrl ? (
        <Image source={{ uri: item.product.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.image} />
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.price}>₹{unitPrice(item)}</Text>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
            onPress={onDecrease}
            disabled={disabled}
            style={styles.stepButton}
          >
            <Text style={styles.stepLabel}>-</Text>
          </Pressable>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
            onPress={onIncrease}
            disabled={disabled}
            style={styles.stepButton}
          >
            <Text style={styles.stepLabel}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.lineTotal}>Item total: ₹{item.lineTotal}</Text>
        <Pressable accessibilityRole="button" onPress={onRemove} disabled={disabled}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.md,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  disabled: {
    opacity: 0.55,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.muted,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: "600",
  },
  price: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  stepButton: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  stepLabel: {
    fontSize: theme.typography.subheading,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  quantity: {
    minWidth: 24,
    textAlign: "center",
    fontSize: theme.typography.body,
    color: theme.colors.text,
    fontWeight: "600",
  },
  lineTotal: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  remove: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
    fontWeight: "600",
    minHeight: 24,
  },
});
