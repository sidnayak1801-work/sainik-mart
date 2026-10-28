import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ApiError } from "@/api/client";
import { getProduct } from "@/api/products";
import { CartQtyControls } from "@/components/CartQtyControls";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FooterBar } from "@/components/FooterBar";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { useCart } from "@/context/CartContext";
import { theme } from "@/theme";
import type { Product } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";
import { cloudinaryImage } from "@/utils/image";
import { formatPackSize } from "@/utils/packSize";

type Props = NativeStackScreenProps<MainStackParamList, "ProductDetails">;

export function ProductDetailsScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { itemCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProduct(await getProduct(productId));
    } catch (err) {
      setProduct(null);
      setError(err instanceof ApiError ? err.message : "Unable to load this product.");
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  const discounted =
    product?.discountPrice !== null && product?.discountPrice !== undefined ? product.discountPrice : null;
  const outOfStock = product?.stockQuantity !== undefined && product.stockQuantity <= 0;
  const packSize = formatPackSize(product?.packQuantity, product?.packUnit);

  return (
    <Screen
      footer={
        product ? (
          <FooterBar safeBottom>
            <View>
              <Text style={styles.footerLabel}>{outOfStock ? "Out of stock" : "Total"}</Text>
              <Text style={styles.footerPrice}>₹{discounted ?? product.price}</Text>
            </View>
            <View style={styles.footerAction}>
              <View style={styles.qtyWrap}>
                <CartQtyControls product={product} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View cart"
                onPress={() => navigation.navigate("MainTabs", { screen: "Cart" })}
                style={styles.cartButton}
              >
                <Ionicons name="cart" size={22} color={theme.colors.primaryText} />
                {itemCount > 0 ? (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeLabel}>{itemCount > 99 ? "99+" : String(itemCount)}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </FooterBar>
        ) : null
      }
    >
      {loading ? <Loading /> : null}
      {error ? (
        <>
          <ErrorMessage message={error} onRetry={() => void load()} />
          {error.toLowerCase().includes("not found") ? (
            <EmptyState title="Product unavailable" description="This item is not in the catalog." />
          ) : null}
        </>
      ) : null}
      {product ? (
        <>
          {product.imageUrl ? (
            <Image source={{ uri: cloudinaryImage(product.imageUrl, "detail") }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.image} />
          )}
          <Text style={styles.title}>{product.name}</Text>
          {packSize ? <Text style={styles.meta}>{packSize}</Text> : null}
          {product.category ? <Text style={styles.meta}>{product.category.name}</Text> : null}
          <View style={styles.prices}>
            {discounted !== null ? (
              <>
                <Text style={styles.price}>₹{discounted}</Text>
                <Text style={styles.original}>₹{product.price}</Text>
              </>
            ) : (
              <Text style={styles.price}>₹{product.price}</Text>
            )}
          </View>
          {product.stockQuantity !== undefined ? (
            <Text style={styles.meta}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
            </Text>
          ) : null}
          {product.description ? <Text style={styles.body}>{product.description}</Text> : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 260,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.muted,
    width: "100%",
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
  },
  prices: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  price: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.bold,
  },
  original: {
    color: theme.colors.textSecondary,
    textDecorationLine: "line-through",
    fontSize: theme.typography.body,
  },
  meta: {
    color: theme.colors.textSecondary,
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 24,
  },
  footerLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  footerPrice: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading,
    fontWeight: "700",
  },
  footerAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
  },
  qtyWrap: {
    flexShrink: 1,
    minWidth: 140,
  },
  cartButton: {
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeLabel: {
    color: theme.colors.primaryText,
    fontSize: 10,
    fontWeight: theme.weight.bold,
  },
});
