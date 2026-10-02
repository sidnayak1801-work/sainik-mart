import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartQtyControls } from "@/components/CartQtyControls";
import { theme } from "@/theme";
import type { Product } from "@/types/models";
import { cloudinaryImage } from "@/utils/image";

type AddToCartSheetProps = {
  visible: boolean;
  product: Product;
  onClose: () => void;
  onViewDetails: () => void;
};

const hasDiscount = (product: Product): boolean => {
  return product.discountPrice !== null && product.discountPrice !== undefined;
};

export function AddToCartSheet({ visible, product, onClose, onViewDetails }: AddToCartSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View style={[styles.sheetWrap, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
          <View style={styles.closeRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>
          <View style={styles.sheet}>
            <View style={styles.preview}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: cloudinaryImage(product.imageUrl, "cart") }}
                  style={styles.image}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.image} />
              )}
              <View style={styles.previewMeta}>
                <Text style={styles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View details"
                  onPress={onViewDetails}
                  style={styles.detailsRow}
                >
                  <Text style={styles.detailsLabel}>View details</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>
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
            <CartQtyControls product={product} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.scrim,
  },
  sheetWrap: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  closeRow: {
    alignItems: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.sm,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadow.lift,
  },
  preview: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.muted,
  },
  previewMeta: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.subheading,
    fontWeight: theme.weight.bold,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
    minHeight: 32,
  },
  detailsLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
  },
  prices: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  price: {
    color: theme.colors.accent,
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.bold,
  },
  original: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textDecorationLine: "line-through",
  },
});
