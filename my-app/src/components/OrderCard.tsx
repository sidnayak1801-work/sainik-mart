import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { theme } from "@/theme";
import type { OrderSummary } from "@/types/models";
import { formatDateTime, formatOrderStatus, shortOrderId } from "@/utils/date";

type OrderCardProps = {
  order: OrderSummary;
  onPress: () => void;
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  const cancelled = order.orderStatus === "CANCELLED";

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card>
        <View style={styles.top}>
          <Text style={styles.id}>Order #{shortOrderId(order.id)}</Text>
          <View style={[styles.statusPill, cancelled ? styles.cancelledPill : null]}>
            <Text style={[styles.status, cancelled ? styles.cancelled : null]}>
              {formatOrderStatus(order.orderStatus)}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
        <View style={styles.bottom}>
          <Text style={styles.meta}>
            {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </Text>
          <Text style={styles.total}>₹{order.totalAmount}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  id: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.bold,
  },
  statusPill: {
    backgroundColor: theme.colors.primaryRamp[25],
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  cancelledPill: {
    backgroundColor: theme.colors.dangerRamp[25],
  },
  status: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.bold,
  },
  cancelled: {
    color: theme.colors.danger,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.xs,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  total: {
    color: theme.colors.primary,
    fontSize: theme.typography.subheading,
    fontWeight: theme.weight.bold,
  },
});
