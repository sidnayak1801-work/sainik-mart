import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { listOrders } from "@/api/orders";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { OrderCard } from "@/components/OrderCard";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { OrderSummary } from "@/types/models";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Orders">,
  NativeStackScreenProps<MainStackParamList>
>;

export function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await listOrders({ page: 1, limit: 20 });
      setOrders(result.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load your orders.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        setError(null);
        try {
          const result = await listOrders({ page: 1, limit: 20 });
          if (!cancelled) {
            setOrders(result.items);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof ApiError ? err.message : "Unable to load your orders.");
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      void run();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const isEmpty = !loading && !error && orders.length === 0;

  return (
    <Screen scroll={false}>
      <Text style={styles.title}>My Orders</Text>
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
      {isEmpty ? (
        <View style={styles.empty}>
          <EmptyState
            centered
            title="No orders yet"
            description="Your orders will appear here after you place your first order."
          />
          <Button title="Continue Shopping" onPress={() => navigation.navigate("Home")} />
        </View>
      ) : null}
      {!loading && orders.length > 0 ? (
        <FlatList
          style={styles.listFlex}
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
        />
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
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
