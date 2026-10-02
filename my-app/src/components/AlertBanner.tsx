import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";

type AlertTone = "primary" | "danger" | "accent";

type AlertBannerProps = {
  message: string;
  tone?: AlertTone;
  children?: ReactNode;
};

const TONE = {
  primary: {
    background: theme.colors.primaryRamp[100],
    border: theme.colors.primaryRamp[200],
    color: theme.colors.primaryRamp[800],
  },
  danger: {
    background: theme.colors.dangerRamp[100],
    border: theme.colors.dangerRamp[200],
    color: theme.colors.dangerRamp[800],
  },
  accent: {
    background: theme.colors.accentRamp[100],
    border: theme.colors.accentRamp[200],
    color: theme.colors.accentRamp[800],
  },
} as const;

export function AlertBanner({ message, tone = "primary", children }: AlertBannerProps) {
  const palette = TONE[tone];

  return (
    <View style={[styles.wrap, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <Text style={[styles.message, { color: palette.color }]}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: theme.radius.xs,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.body,
    fontWeight: theme.weight.medium,
    lineHeight: 24,
  },
});
