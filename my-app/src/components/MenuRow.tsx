import { Pressable, StyleSheet, Text } from "react-native";

import { theme } from "@/theme";

type MenuRowProps = {
  label: string;
  onPress: () => void;
  danger?: boolean;
};

export function MenuRow({ label, onPress, danger = false }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={[styles.label, danger ? styles.danger : null]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: "600",
  },
  danger: {
    color: theme.colors.danger,
  },
  chevron: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.heading,
    lineHeight: 24,
  },
});
