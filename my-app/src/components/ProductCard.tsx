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
        <View style={styles.row}>
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
          <View style={styles.addChip}>
            <Text style={styles.addLabel}>ADD</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    flex: 1,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  image: {
    aspectRatio: 1,
    backgroundColor: theme.colors.muted,
    width: "100%",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  prices: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexShrink: 1,
  },
  price: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  original: {
    color: theme.colors.textSecondary,
    textDecorationLine: "line-through",
  },
  addChip: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    minHeight: 32,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.caption,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
});
