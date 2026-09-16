import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "OrderDetails">;

export function OrderDetailsScreen({ route }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Order Details</Text>
      <Text style={styles.subtitle}>
        Order {route.params.orderId ?? "unknown"} is a placeholder.
      </Text>
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
  },
});
