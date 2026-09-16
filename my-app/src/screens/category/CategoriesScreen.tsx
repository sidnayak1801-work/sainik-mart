import { StyleSheet, Text } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";

export function CategoriesScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Categories</Text>
      <EmptyState title="No categories yet" description="Category browsing will be added later." />
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
