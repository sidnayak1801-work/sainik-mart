import { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "@/theme";

const LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (digits: string) => void;
  error?: boolean;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, error = false, disabled = false }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.replace(/\D/g, "").slice(0, LENGTH);
  const focusedIndex = Math.min(digits.length, LENGTH - 1);

  return (
    <Pressable
      accessibilityRole="keyboardkey"
      onPress={() => inputRef.current?.focus()}
      style={styles.row}
    >
      <TextInput
        ref={inputRef}
        value={digits}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, LENGTH))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LENGTH}
        caretHidden
        autoFocus
        editable={!disabled}
        style={styles.hidden}
        accessibilityLabel="6-digit code"
      />
      {[0, 1, 2].map((index) => (
        <DigitBox
          key={index}
          digit={digits[index]}
          active={!disabled && focusedIndex === index && digits.length < LENGTH}
          filled={Boolean(digits[index])}
          error={error}
        />
      ))}
      <Text style={styles.hyphen}>–</Text>
      {[3, 4, 5].map((index) => (
        <DigitBox
          key={index}
          digit={digits[index]}
          active={!disabled && focusedIndex === index && digits.length < LENGTH}
          filled={Boolean(digits[index])}
          error={error}
        />
      ))}
    </Pressable>
  );
}

function DigitBox({
  digit,
  active,
  filled,
  error,
}: {
  digit?: string;
  active: boolean;
  filled: boolean;
  error: boolean;
}) {
  return (
    <View
      style={[
        styles.box,
        filled && styles.boxFilled,
        active && styles.boxActive,
        error && styles.boxError,
      ]}
    >
      <Text style={styles.digit}>{digit ?? ""}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  hidden: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: theme.colors.text,
  },
  box: {
    flex: 1,
    minHeight: 56,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  boxFilled: {
    borderColor: theme.colors.primaryLight,
  },
  boxActive: {
    borderColor: theme.colors.primary,
    ...theme.shadow.focus,
  },
  boxError: {
    borderColor: theme.colors.danger,
    ...theme.shadow.focusDanger,
  },
  digit: {
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.semibold,
    color: theme.colors.text,
  },
  hyphen: {
    fontSize: theme.typography.heading,
    fontWeight: theme.weight.medium,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xs,
  },
});
