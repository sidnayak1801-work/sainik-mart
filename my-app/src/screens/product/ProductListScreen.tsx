import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getCategory } from "@/api/categories";
import { ApiError } from "@/api/client";
import { listProducts } from "@/api/products";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Product, Subcategory } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "ProductList">;

export function ProductListScreen({ navigation, route }: Props) {
  const { categoryId, search } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSubcategoryId(undefined);
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    let cancelled = false;
    void getCategory(categoryId)
      .then((category) => {
        if (!cancelled) setSubcategories(category.subcategories ?? []);
      })
      .catch(() => {
        if (!cancelled) setSubcategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      setError(null);
      try {
        const result = await listProducts({
          page: nextPage,
          limit: 10,
          categoryId,
          subcategoryId,
          search,
        });
        setProducts((current) => (append ? [...current, ...result.items] : result.items));
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Unable to load products.");
      }
    },
    [categoryId, search, subcategoryId],
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

  const emptyDescription = subcategoryId
    ? "No products in this subcategory"
    : "Try another category or search.";

  return (
    <Screen safeBottom>
      {search ? <Text style={styles.subtitle}>Results for “{search}”</Text> : null}
      {categoryId && subcategories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroller}
          contentContainerStyle={styles.chips}
        >
          <Pressable
            onPress={() => setSubcategoryId(undefined)}
            style={[styles.chip, !subcategoryId ? styles.chipSelected : null]}
          >
            <Text style={[styles.chipLabel, !subcategoryId ? styles.chipLabelSelected : null]}>All</Text>
          </Pressable>
          {subcategories.map((sub) => {
            const selected = subcategoryId === sub.id;
            return (
              <Pressable
                key={sub.id}
                onPress={() => setSubcategoryId(sub.id)}
                style={[styles.chip, selected ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>{sub.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void loadPage(1, false)} /> : null}
      {!loading && !error && products.length === 0 ? (
        <EmptyState title="No products found" description={emptyDescription} />
      ) : (
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <View style={styles.card}>
                <ProductCard
                  compact
                  align="start"
                  product={product}
                  onPress={() => navigation.navigate("ProductDetails", { productId: product.id })}
                />
              </View>
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
  subtitle: {
    color: theme.colors.textSecondary,
  },
  chipScroller: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  chip: {
    height: 36,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipLabel: {
    color: theme.colors.textSecondary,
    fontWeight: theme.weight.medium,
    fontSize: theme.typography.caption,
  },
  chipLabelSelected: {
    color: theme.colors.primaryText,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -theme.spacing.xs,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
});
