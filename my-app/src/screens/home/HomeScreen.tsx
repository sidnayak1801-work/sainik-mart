import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { requireAuth } from "@/navigation/authRedirect";
import { HomePromoCarousel } from "@/screens/home/HomePromoCarousel";
import { HomeQuickActions } from "@/screens/home/HomeQuickActions";
import { homeTheme } from "@/screens/home/homeTheme";
import { theme } from "@/theme";
import { APP_TAGLINE } from "@/utils/constants";
import type { Category, Product } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<MainStackParamList>
>;

const HOME_CATEGORY_LIMIT = 8;

const isDiscounted = (product: Product): boolean => {
  return product.discountPrice !== null && product.discountPrice !== undefined;
};

const isInStock = (product: Product): boolean => {
  return product.stockQuantity === undefined || product.stockQuantity > 0;
};

export function HomeScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuth();
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
  const offerProduct = useMemo(
    () => products.find((product) => isDiscounted(product) && isInStock(product)),
    [products],
  );

  const openPopular = () => navigation.navigate("ProductList", { title: "Popular" });
  const openCategories = () => navigation.navigate("Categories");
  const openOffers = () => {
    if (offerProduct) {
      navigation.navigate("ProductDetails", { productId: offerProduct.id });
      return;
    }
    openPopular();
  };

  return (
    <Screen
      padded={false}
      refreshing={refreshing}
      onRefresh={() => void onRefresh()}
      backgroundColor={homeTheme.colors.canvas}
    >
      <StoreHeader variant="home" />
      <View style={styles.body}>
        {loading ? <Loading /> : null}
        {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}

        <HomeQuickActions
          actions={[
            { key: "categories", label: "Shop categories", icon: "grid-outline", onPress: openCategories },
            { key: "popular", label: "Popular", icon: "flame-outline", onPress: openPopular },
            { key: "offers", label: "Offers", icon: "pricetag-outline", onPress: openOffers },
            {
              key: "orders",
              label: "My orders",
              icon: "receipt-outline",
              onPress: () => {
                if (!requireAuth(navigation, isAuthenticated, "Orders")) return;
                navigation.navigate("MainTabs", { screen: "Orders" });
              },
            },
          ]}
        />

        <HomePromoCarousel
          cards={[
            {
              key: "festive",
              title: "Festive grocery deals",
              subtitle: "Stock the kitchen for family gatherings.",
              cta: "Shop now",
              backgroundColor: homeTheme.colors.red,
              onPress: openPopular,
            },
            {
              key: "delivery",
              title: "Free delivery over ₹499",
              subtitle: "On your next grocery order.",
              cta: "Browse",
              backgroundColor: homeTheme.colors.orange,
              onPress: openCategories,
            },
            {
              key: "veggies",
              title: "Fresh veggies today",
              subtitle: "Seasonal produce, packed this morning.",
              cta: "See veggies",
              backgroundColor: homeTheme.colors.red600,
              onPress: openCategories,
            },
          ]}
        />

        <View style={[styles.hero, homeTheme.shadow.sm]}>
          <View style={styles.heroWell}>
            <Text style={styles.heroMark}>SM</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Sainik Mart</Text>
            <Text style={styles.heroTitle}>{APP_TAGLINE}</Text>
          </View>
        </View>

        <SectionHeader
          title="Shop by category"
          titleColor={homeTheme.colors.dark}
          seeAllColor={homeTheme.colors.blue}
          onSeeAll={openCategories}
        />
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

        <SectionHeader
          title="Popular"
          titleColor={homeTheme.colors.dark}
          seeAllColor={homeTheme.colors.blue}
          onSeeAll={openPopular}
        />
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
    backgroundColor: homeTheme.colors.canvas,
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
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: homeTheme.colors.blue25,
    borderRadius: homeTheme.radius.sm,
    borderWidth: 1,
    borderColor: homeTheme.colors.gray50,
    padding: theme.spacing.md,
  },
  heroWell: {
    width: 56,
    height: 56,
    borderRadius: homeTheme.radius.sm,
    backgroundColor: homeTheme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  heroMark: {
    color: homeTheme.colors.blue,
    fontSize: theme.typography.h5,
    fontWeight: theme.weight.bold,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  heroEyebrow: {
    color: homeTheme.colors.gray300,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.semibold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: homeTheme.colors.dark,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
  },
});
