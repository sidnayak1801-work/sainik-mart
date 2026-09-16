import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listCategories } from "@/api/categories";
import { ApiError } from "@/api/client";
import { listProducts } from "@/api/products";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Category, Product } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";
import { APP_NAME } from "@/utils/constants";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<MainStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const [search, setSearch] = useState("");
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
        listProducts({ page: 1, limit: 10 }),
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

  const onSearch = () => {
    const query = search.trim();
    if (!query) return;
    navigation.navigate("ProductList", { search: query, title: query });
  };

  return (
    <Screen refreshing={refreshing} onRefresh={() => void onRefresh()}>
      <Text style={styles.brand}>{APP_NAME}</Text>
      <Text style={styles.title}>Home</Text>
      <Input
        label="Search"
        placeholder="Search milk, fruit, bread..."
        value={search}
        onChangeText={setSearch}
      />
      <Button title="Search products" onPress={onSearch} />

      <View style={styles.promo}>
        <Text style={styles.promoTitle}>Groceries in minutes</Text>
        <Text style={styles.promoBody}>Fresh staples delivered to your door. Browse categories or search below.</Text>
      </View>

      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}

      <Text style={styles.section}>Categories</Text>
      {!loading && !error && categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Catalog categories will appear here." />
      ) : (
        <View style={styles.chips}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={styles.chip}
              onPress={() =>
                navigation.navigate("ProductList", { categoryId: category.id, title: category.name })
              }
            >
              <Text style={styles.chipText}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.section}>Popular</Text>
      {!loading && !error && products.length === 0 ? (
        <EmptyState title="No products yet" description="Popular items will appear here." />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
  },
  promo: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  promoTitle: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.heading,
    fontWeight: "700",
  },
  promoBody: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
  },
  section: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipText: {
    color: theme.colors.text,
    fontWeight: "600",
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
