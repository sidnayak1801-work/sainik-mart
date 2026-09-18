import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type EmptyStateProps = {
  title: string;
  description?: string;
  centered?: boolean;
};

export function EmptyState({ title, description, centered = false }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, centered ? styles.centered : null]}>
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: theme.typography.heading,
    color: theme.colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
