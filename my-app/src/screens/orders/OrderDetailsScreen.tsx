import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getOrderById } from "@/api/orders";
import { ApiError } from "@/api/client";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Loading } from "@/components/Loading";
import { OrderItemRow } from "@/components/OrderItemRow";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { Order } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";
import { formatDateTime, formatOrderStatus, shortOrderId } from "@/utils/date";

type Props = NativeStackScreenProps<MainStackParamList, "OrderDetails">;

export function OrderDetailsScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setOrder(await getOrderById(orderId));
    } catch (err) {
      setOrder(null);
      setError(err instanceof ApiError ? err.message : "Unable to load order details.");
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        setError(null);
        try {
          const next = await getOrderById(orderId);
          if (!cancelled) {
            setOrder(next);
          }
        } catch (err) {
          if (!cancelled) {
            setOrder(null);
            setError(err instanceof ApiError ? err.message : "Unable to load order details.");
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
    }, [orderId]),
  );

  const cancelled = order?.orderStatus === "CANCELLED";

  return (
    <Screen>
      {loading ? <Loading /> : null}
      {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
      {!loading && order ? (
        <>
          <Text style={styles.title}>Order #{shortOrderId(order.id)}</Text>
          <Text style={styles.date}>{order.createdAt ? formatDateTime(order.createdAt) : ""}</Text>
          <Text style={[styles.status, cancelled ? styles.cancelled : null]}>
            {formatOrderStatus(order.orderStatus)}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
            </View>
          </View>

          {order.address ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <View style={styles.addressCard}>
                <Text style={styles.addressLine}>{order.address.addressLine}</Text>
                <Text style={styles.addressMeta}>
                  {order.address.city} - {order.address.pincode}
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  status: {
    color: theme.colors.primary,
    fontSize: theme.typography.subheading,
    fontWeight: "700",
  },
  cancelled: {
    color: theme.colors.danger,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.typography.subheading,
    color: theme.colors.text,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: theme.typography.heading,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  addressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  addressLine: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  addressMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
