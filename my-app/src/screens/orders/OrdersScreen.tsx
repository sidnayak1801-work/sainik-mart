import { StyleSheet, Text } from "react-native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Orders">,
  NativeStackScreenProps<MainStackParamList>
>;

export function OrdersScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Orders</Text>
      <EmptyState title="No orders yet" description="Past orders will show here after Day 8+." />
      <Button
        title="View sample order"
        onPress={() => navigation.navigate("OrderDetails", { orderId: "demo" })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.title,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
});
