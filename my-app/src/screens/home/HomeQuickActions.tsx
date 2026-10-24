import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/theme";

type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type HomeQuickActionsProps = {
  actions: QuickAction[];
};

export function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={styles.item}
        >
          <View style={styles.well}>
            <Ionicons name={action.icon} size={22} color={theme.colors.primary} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xs,
    minHeight: 48,
  },
  well: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryRamp[25],
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: theme.weight.medium,
    textAlign: "center",
    minHeight: 32,
  },
});
