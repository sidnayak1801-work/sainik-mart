import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AddToCartSheet } from "@/components/AddToCartSheet";
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const outOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;

  const openSheet = () => {
    if (outOfStock) return;
    setSheetOpen(true);
  };

  return (
    <>
      <Pressable onPress={onPress} style={[styles.card, compact && styles.cardCompact]}>
        {product.imageUrl ? (
          <Image
            source={{ uri: cloudinaryImage(product.imageUrl, "card") }}
            style={[styles.image, compact && styles.imageCompact]}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.image, compact && styles.imageCompact]} />
        )}
        <View style={[styles.meta, compact && styles.metaCompact]}>
          <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={compact ? styles.stack : styles.row}>
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
              onPress={openSheet}
              disabled={outOfStock}
              style={[styles.addChip, compact && styles.addChipCompact, outOfStock && styles.addDisabled]}
            >
              <Text style={[styles.addLabel, compact && styles.addLabelCompact]}>ADD</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
      <AddToCartSheet
        visible={sheetOpen}
        product={product}
        onClose={() => setSheetOpen(false)}
        onViewDetails={() => {
          setSheetOpen(false);
          onPress?.();
        }}
      />
    </>
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
  cardCompact: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  image: {
    aspectRatio: 1,
    backgroundColor: theme.colors.muted,
    width: "100%",
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
  },
  imageCompact: {
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
  },
  meta: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metaCompact: {
    padding: theme.spacing.xs,
    gap: 2,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  nameCompact: {
    fontSize: 11,
    minHeight: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  stack: {
    gap: 4,
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
  priceCompact: {
    fontSize: 11,
  },
  original: {
    color: theme.colors.textSecondary,
    textDecorationLine: "line-through",
  },
  originalCompact: {
    fontSize: 10,
  },
  addChip: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.sm,
    minHeight: 32,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  addChipCompact: {
    minHeight: 24,
    alignSelf: "stretch",
    paddingHorizontal: theme.spacing.xs,
  },
  addDisabled: {
    opacity: 0.5,
  },
  addLabel: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.caption,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  addLabelCompact: {
    fontSize: 10,
  },
});
