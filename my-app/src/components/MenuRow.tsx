import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type MenuRowProps = {
  label: string;
  onPress: () => void;
  danger?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function MenuRow({ label, onPress, danger = false, icon }: MenuRowProps) {
  const iconColor = danger ? theme.colors.danger : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.lead}>
        {icon ? <Ionicons name={icon} size={22} color={iconColor} /> : null}
        <Text style={[styles.label, danger ? styles.danger : null]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
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
    gap: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  lead: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
    flexShrink: 1,
  },
  danger: {
    color: theme.colors.danger,
  },
});
