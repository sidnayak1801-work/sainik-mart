import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ApiError } from "@/api/client";
import { listProducts } from "@/api/products";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Product } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "ProductList">;

export function ProductListScreen({ navigation, route }: Props) {
  const { categoryId, search, title } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      setError(null);
      try {
        const result = await listProducts({
          page: nextPage,
          limit: 10,
          categoryId,
          search,
        });
        setProducts((current) => (append ? [...current, ...result.items] : result.items));
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Unable to load products.");
      }
    },
    [categoryId, search],
  );

  useEffect(() => {
    setLoading(true);
    void loadPage(1, false).finally(() => setLoading(false));
  }, [loadPage]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    await loadPage(page + 1, true);
    setLoadingMore(false);
  };

  return (
    <Screen>
      <Text style={styles.title}>{title ?? "Products"}</Text>
      {search ? <Text style={styles.subtitle}>Results for “{search}”</Text> : null}
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void loadPage(1, false)} /> : null}
      {!loading && !error && products.length === 0 ? (
        <EmptyState title="No products found" description="Try another category or search." />
      ) : (
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() => navigation.navigate("ProductDetails", { productId: product.id })}
              />
            </View>
          ))}
        </View>
      )}
      {!loading && page < totalPages ? (
        <Button title="Load more" onPress={() => void loadMore()} loading={loadingMore} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  gridItem: {
    width: "47%",
    flexGrow: 1,
  },
});
