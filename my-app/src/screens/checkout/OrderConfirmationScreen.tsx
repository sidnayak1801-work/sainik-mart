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
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.id}>Order {order.id}</Text>
        <Text style={styles.status}>{order.orderStatus}</Text>
        <Text style={styles.total}>₹{order.totalAmount}</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
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
