import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "OrderConfirmation">;

export function OrderConfirmationScreen({ navigation, route }: Props) {
  const { order } = route.params;

  return (
    <Screen>
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Thank you</Text>
          <Text style={styles.title}>Order placed</Text>
          <Text style={styles.id}>Order {order.id}</Text>
          <Text style={styles.status}>{order.orderStatus}</Text>
          <Text style={styles.total}>₹{order.totalAmount}</Text>
        </View>
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
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.gold,
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
  status: {
    fontSize: theme.typography.subheading,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "center",
  },
  total: {
    fontSize: theme.typography.heading,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
});
