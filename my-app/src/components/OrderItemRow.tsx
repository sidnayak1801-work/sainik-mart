import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import type { OrderLine } from "@/types/models";

type OrderItemRowProps = {
  item: OrderLine;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.meta}>
          ₹{item.price} × {item.quantity}
        </Text>
      </View>
      <Text style={styles.total}>₹{item.total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  total: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
