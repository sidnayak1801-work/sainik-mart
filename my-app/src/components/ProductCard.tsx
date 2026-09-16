import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { Product } from "@/types/models";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
};

const hasDiscount = (product: Product): boolean => {
  return product.discountPrice !== null && product.discountPrice !== undefined;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.image} />
      )}
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.prices}>
          {hasDiscount(product) ? (
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
    flex: 1,
  },
  image: {
    height: 120,
    backgroundColor: theme.colors.muted,
    width: "100%",
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
