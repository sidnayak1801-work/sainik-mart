import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { fetchHealth } from "@/api/health";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ProductCard } from "@/components/ProductCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<MainStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHealth();
      setHealthMessage(result.message);
    } catch (err) {
      setHealthMessage(null);
      setError(err instanceof ApiError ? err.message : "Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Customer home. Catalog data will arrive in a later day.</Text>
      <Button title="Check API" onPress={() => void checkApi()} loading={loading} />
      {healthMessage ? <Text style={styles.ok}>{healthMessage}</Text> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void checkApi()} /> : null}
      <View style={styles.cardWrap}>
        <ProductCard
          product={{ id: "demo", name: "Sample grocery item", price: 80, discountPrice: 69 }}
          onPress={() => navigation.navigate("ProductDetails", { productId: "demo" })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  ok: {
    marginTop: theme.spacing.md,
    color: theme.colors.primary,
  },
  cardWrap: {
    marginTop: theme.spacing.lg,
  },
});
