import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/theme";

type FooterBarProps = {
  children: ReactNode;
  safeBottom?: boolean;
};

export function FooterBar({ children, safeBottom = false }: FooterBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, safeBottom ? { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) } : null]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
