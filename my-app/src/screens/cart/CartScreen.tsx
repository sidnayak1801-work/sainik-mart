import { StyleSheet, Text } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";

export function CartScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Cart</Text>
      <EmptyState title="Your cart is empty" description="Cart items will appear here later." />
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
