import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listCategories } from "@/api/categories";
import { ApiError } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { Screen } from "@/components/Screen";
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
    <Screen refreshing={refreshing} onRefresh={() => void onRefresh()}>
      <Text style={styles.title}>Categories</Text>
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Categories will appear here when the catalog is ready." />
      ) : null}
      {categories.map((category) => (
        <Pressable
          key={category.id}
          style={styles.row}
          onPress={() =>
            navigation.navigate("ProductList", { categoryId: category.id, title: category.name })
          }
        >
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.hint}>View products</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
  },
  row: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  hint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
});
