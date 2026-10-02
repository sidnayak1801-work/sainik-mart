import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { QtyStepper } from "@/components/QtyStepper";
import { theme } from "@/theme";
import type { CartLineItem } from "@/types/models";
import { cloudinaryImage } from "@/utils/image";

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
  const increaseDisabled = disabled || item.quantity >= item.product.stockQuantity;

  return (
    <Card style={disabled ? styles.disabled : undefined}>
      <View style={styles.row}>
        {item.product.imageUrl ? (
          <Image source={{ uri: cloudinaryImage(item.product.imageUrl, "cart") }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.image} />
        )}
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.price}>₹{unitPrice(item)}</Text>
          <QtyStepper
            quantity={item.quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            decreaseDisabled={disabled}
            increaseDisabled={increaseDisabled}
          />
          <Text style={styles.lineTotal}>Item total: ₹{item.lineTotal}</Text>
          <Pressable accessibilityRole="button" onPress={onRemove} disabled={disabled}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  disabled: {
    opacity: 0.65,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.muted,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.h6,
    fontWeight: theme.weight.semibold,
  },
  price: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.bold,
  },
  lineTotal: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.regular,
  },
  remove: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.semibold,
    minHeight: 24,
  },
});
