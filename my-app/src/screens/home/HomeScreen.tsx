import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listCategories } from "@/api/categories";
import { ApiError } from "@/api/client";
import { listProducts } from "@/api/products";
import { CategoryTile } from "@/components/CategoryTile";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { StoreHeader } from "@/components/StoreHeader";
import { theme } from "@/theme";
import { APP_TAGLINE } from "@/utils/constants";
import type { Category, Product } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<MainStackParamList>
>;

const HOME_CATEGORY_LIMIT = 8;

export function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [nextCategories, catalog] = await Promise.all([
        listCategories(),
        listProducts({ page: 1, limit: 16 }),
      ]);
      setCategories(nextCategories);
      setProducts(catalog.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the catalog.");
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const visibleCategories = categories.slice(0, HOME_CATEGORY_LIMIT);

  return (
    <Screen padded={false} refreshing={refreshing} onRefresh={() => void onRefresh()}>
      <StoreHeader />
      <View style={styles.body}>
        {loading ? <Loading /> : null}
        {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}

        <View style={styles.banner}>
          <View style={styles.bannerWell}>
            <Text style={styles.bannerMark}>SM</Text>
          </View>
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerEyebrow}>Sainik Mart</Text>
            <Text style={styles.bannerTitle}>{APP_TAGLINE}</Text>
          </View>
        </View>

        <SectionHeader title="Shop by category" onSeeAll={() => navigation.navigate("Categories")} />
        {!loading && !error && categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Catalog categories will appear here." />
        ) : (
          <View style={styles.categoryGrid}>
            {visibleCategories.map((category) => (
              <CategoryTile
                key={category.id}
                category={category}
                onPress={() =>
                  navigation.navigate("ProductList", { categoryId: category.id, title: category.name })
                }
              />
            ))}
          </View>
        )}

        <SectionHeader title="Popular" onSeeAll={() => navigation.navigate("ProductList", { title: "Popular" })} />
        {!loading && !error && products.length === 0 ? (
          <EmptyState title="No products yet" description="Popular items will appear here." />
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <ProductCard
                  compact
                  product={product}
                  onPress={() => navigation.navigate("ProductDetails", { productId: product.id })}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  productItem: {
    width: "25%",
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.accent,
    padding: theme.spacing.md,
  },
  bannerWell: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryRamp[25],
    alignItems: "center",
    justifyContent: "center",
  },
  bannerMark: {
    color: theme.colors.primary,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.bold,
  },
  bannerCopy: {
    flex: 1,
    gap: 2,
  },
  bannerEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.semibold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  bannerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
  },
});
