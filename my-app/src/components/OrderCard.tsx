import { Pressable, StyleSheet, Text, View } from "react-native";

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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Text style={styles.id}>Order #{shortOrderId(order.id)}</Text>
        <Text style={[styles.status, cancelled ? styles.cancelled : null]}>
          {formatOrderStatus(order.orderStatus)}
        </Text>
      </View>
      <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
      <View style={styles.bottom}>
        <Text style={styles.meta}>
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </Text>
        <Text style={styles.total}>₹{order.totalAmount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    minHeight: 48,
    shadowColor: theme.colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
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
    fontWeight: "700",
  },
  status: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: "700",
  },
  cancelled: {
    color: theme.colors.danger,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  total: {
    color: theme.colors.primary,
    fontSize: theme.typography.subheading,
    fontWeight: "700",
  },
});
