import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "@/theme";

type CardProps = {
  children: ReactNode;
  promo?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, promo = false, style }: CardProps) {
  return <View style={[promo ? styles.promo : styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xs,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  promo: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
});
