import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { theme } from "@/theme";

type ButtonVariant = "primary" | "accent" | "ghost";

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === "ghost" ? theme.colors.primary : theme.colors.primaryText;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === "accent" && styles.accent,
        variant === "ghost" && styles.ghost,
        pressed &&
          (variant === "ghost" ? styles.pressedGhost : variant === "accent" ? styles.pressedAccent : styles.pressed),
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text style={[styles.title, variant === "ghost" && styles.ghostTitle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  accent: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: theme.colors.primary,
  },
  pressed: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  pressedAccent: {
    backgroundColor: theme.colors.accentRamp[600],
    borderColor: theme.colors.accentRamp[600],
  },
  pressedGhost: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.65,
  },
  title: {
    color: theme.colors.primaryText,
    fontSize: theme.typography.body,
    fontWeight: theme.weight.semibold,
  },
  ghostTitle: {
    color: theme.colors.primary,
  },
});
