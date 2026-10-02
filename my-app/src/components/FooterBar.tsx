import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { theme } from "@/theme";

type FooterBarProps = {
  children: ReactNode;
};

export function FooterBar({ children }: FooterBarProps) {
  return <View style={styles.bar}>{children}</View>;
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
