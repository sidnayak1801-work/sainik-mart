import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { Product } from "@/types/models";
import { cloudinaryImage } from "@/utils/image";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  compact?: boolean;
};

const hasDiscount = (product: Product): boolean => {
  return product.discountPrice !== null && product.discountPrice !== undefined;
};

export function ProductCard({ product, onPress, compact = false }: ProductCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={onPress}
      style={styles.tile}
    >
      <View style={styles.well}>
        {product.imageUrl ? (
          <Image
            source={{ uri: cloudinaryImage(product.imageUrl, "card") }}
            style={styles.image}
            contentFit="contain"
          />
        ) : (
          <View style={styles.image} />
        )}
      </View>
      <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.prices}>
        {hasDiscount(product) ? (
          <>
            <Text style={[styles.price, compact && styles.priceCompact]}>₹{product.discountPrice}</Text>
            <Text style={[styles.original, compact && styles.originalCompact]}>₹{product.price}</Text>
          </>
        ) : (
          <Text style={[styles.price, compact && styles.priceCompact]}>₹{product.price}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  well: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryRamp[25],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: theme.spacing.xs,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.medium,
    textAlign: "center",
    minHeight: 36,
    alignSelf: "stretch",
  },
  nameCompact: {
    minHeight: 32,
  },
  prices: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  price: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.bold,
  },
  priceCompact: {
    fontSize: theme.typography.caption,
  },
  original: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    textDecorationLine: "line-through",
  },
  originalCompact: {
    fontSize: theme.typography.caption,
  },
});
