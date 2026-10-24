import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { OrderItemRow } from "@/components/OrderItemRow";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";
import { formatDateTime, formatOrderStatus, formatPaymentMethod, formatPaymentStatus, shortOrderId } from "@/utils/date";

type Props = NativeStackScreenProps<MainStackParamList, "OrderConfirmation">;

export function OrderConfirmationScreen({ navigation, route }: Props) {
  const { order } = route.params;

  return (
    <Screen>
      <View style={styles.body}>
        <Card style={styles.confirmCard}>
          <Text style={styles.eyebrow}>Thank you</Text>
          <Text style={styles.title}>Order placed</Text>
          <Text style={styles.id}>Order #{shortOrderId(order.id)}</Text>
          {order.createdAt ? <Text style={styles.meta}>{formatDateTime(order.createdAt)}</Text> : null}
          <Text style={styles.status}>{formatOrderStatus(order.orderStatus)}</Text>
          <Text style={styles.payLine}>{formatPaymentMethod(order.paymentMethod)}</Text>
          <Text style={styles.payLine}>Payment {formatPaymentStatus(order.paymentStatus)}</Text>
          <Text style={styles.total}>₹{order.totalAmount}</Text>
        </Card>

        {order.items.length > 0 ? (
          <Card>
            <Text style={styles.sectionTitle}>Items</Text>
            {order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalMeta}>₹{order.subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery</Text>
              <Text style={styles.totalMeta}>₹{order.deliveryFee}</Text>
            </View>
            {order.discount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalMeta}>₹{order.discount}</Text>
              </View>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.payableLabel}>Amount payable</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
            </View>
          </Card>
        ) : null}

        {order.address ? (
          <Card>
            <Text style={styles.sectionTitle}>Delivery address</Text>
            <Text style={styles.addressLine}>{order.address.addressLine}</Text>
            <Text style={styles.meta}>
              {order.address.city} - {order.address.pincode}
            </Text>
          </Card>
        ) : null}
      </View>
      <Button
        title="Continue Shopping"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs", params: { screen: "Home" } }],
          })
        }
      />
      <Button
        title="View orders"
        variant="ghost"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "MainTabs", params: { screen: "Orders" } }],
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: theme.spacing.md,
  },
  confirmCard: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.success,
    fontSize: theme.typography.caption,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  id: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: "center",
  },
  status: {
    fontSize: theme.typography.subheading,
    fontWeight: "700",
    color: theme.colors.success,
    textAlign: "center",
  },
  payLine: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    textAlign: "center",
  },
  total: {
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
  totalMeta: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  payableLabel: {
    fontSize: theme.typography.subheading,
    color: theme.colors.text,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: theme.typography.heading,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  addressLine: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
});
