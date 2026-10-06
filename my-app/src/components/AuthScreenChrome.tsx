import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BrandLogo } from "@/components/BrandLogo";
import { Screen } from "@/components/Screen";
import { theme } from "@/theme";

type AuthScreenChromeProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  logo?: boolean;
  onBack?: () => void;
};

type AuthTextLinkProps = {
  prompt: string;
  action: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthTextLink({ prompt, action, onPress, disabled = false }: AuthTextLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${prompt} ${action}`}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed, disabled && styles.linkDisabled]}
    >
      <Text style={styles.linkPrompt}>
        {prompt ? `${prompt} ` : ""}
        <Text style={styles.linkAction}>{action}</Text>
      </Text>
    </Pressable>
  );
}

export function AuthScreenChrome({
  title,
  subtitle,
  children,
  footer,
  logo = false,
  onBack,
}: AuthScreenChromeProps) {
  return (
    <Screen>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      {logo ? (
        <View style={styles.brand}>
          <BrandLogo size="sm" />
        </View>
      ) : null}
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
      {footer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    marginLeft: -theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  backPressed: {
    opacity: 0.65,
  },
  backSpacer: {
    height: theme.spacing.sm,
  },
  brand: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing.md,
  },
  heading: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  linkWrap: {
    alignSelf: "flex-start",
    paddingVertical: theme.spacing.xs,
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  linkPrompt: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
  linkAction: {
    color: theme.colors.primary,
    fontWeight: theme.weight.semibold,
  },
});
