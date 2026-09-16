import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.heading,
    color: theme.colors.text,
    fontWeight: "600",
  },
  description: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
