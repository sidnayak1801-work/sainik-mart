import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listCategories } from "@/api/categories";
import { ApiError } from "@/api/client";
import { CategoryTile } from "@/components/CategoryTile";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { StoreHeader } from "@/components/StoreHeader";
import { theme } from "@/theme";
import type { Category } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Categories">,
  NativeStackScreenProps<MainStackParamList>
>;

export function CategoriesScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCategories(await listCategories());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load categories.");
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

  return (
    <Screen padded={false} refreshing={refreshing} onRefresh={() => void onRefresh()}>
      <StoreHeader />
      <View style={styles.body}>
        <SectionHeader title="All categories" />
        {loading ? <Loading /> : null}
        {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
        {!loading && !error && categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Categories will appear here when the catalog is ready." />
        ) : (
          <View style={styles.grid}>
            {categories.map((category) => (
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
