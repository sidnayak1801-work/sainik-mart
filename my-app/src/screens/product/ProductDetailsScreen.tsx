import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { addCartItem } from "@/api/cart";
import { ApiError } from "@/api/client";
import { getProduct } from "@/api/products";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Product } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";
import { cloudinaryImage } from "@/utils/image";

type Props = NativeStackScreenProps<MainStackParamList, "ProductDetails">;

export function ProductDetailsScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const onAddToCart = async () => {
    if (!product || adding || outOfStock) return;
    setActionError(null);
    setAdding(true);
    try {
      await addCartItem(product.id, 1);
      navigation.navigate("MainTabs", { screen: "Cart" });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to add this product to your cart.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Screen>
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
          {actionError ? <ErrorMessage message={actionError} /> : null}
          <Button
            title="Add to Cart"
            onPress={() => void onAddToCart()}
            loading={adding}
            disabled={outOfStock}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 220,
    borderRadius: theme.radius.md,
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
    fontWeight: "700",
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
    lineHeight: 22,
  },
});
