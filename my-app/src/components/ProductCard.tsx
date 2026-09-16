import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { Product } from "@/types/models";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.image} />
      <View style={styles.meta}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.prices}>
          {product.discountPrice !== undefined ? (
            <>
              <Text style={styles.price}>₹{product.discountPrice}</Text>
              <Text style={styles.original}>₹{product.price}</Text>
            </>
          ) : (
            <Text style={styles.price}>₹{product.price}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  image: {
    height: 120,
    backgroundColor: theme.colors.muted,
  },
  meta: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  prices: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  price: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  original: {
    color: theme.colors.textSecondary,
    textDecorationLine: "line-through",
  },
});
