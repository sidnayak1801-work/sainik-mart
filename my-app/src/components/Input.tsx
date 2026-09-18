import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type TextInputProps,
} from "react-native";

import { theme } from "@/theme";

type InputProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
  englishOnly?: boolean;
};

const isNumericKeyboard = (keyboardType?: KeyboardTypeOptions) =>
  keyboardType === "phone-pad" || keyboardType === "number-pad" || keyboardType === "numeric";

const resolveKeyboardType = (
  keyboardType: KeyboardTypeOptions | undefined,
  englishOnly: boolean,
): KeyboardTypeOptions => {
  if (englishOnly && isNumericKeyboard(keyboardType)) {
    return Platform.OS === "ios" ? "numbers-and-punctuation" : "phone-pad";
  }
  if (isNumericKeyboard(keyboardType) && keyboardType) {
    return keyboardType;
  }
  if (englishOnly) {
    return Platform.OS === "ios" ? "ascii-capable" : "visible-password";
  }
  return keyboardType ?? "default";
};

const toAsciiDigit = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code >= 0x0966 && code <= 0x096f) return String(code - 0x0966);
  if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
  if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
  return char;
};

const toEnglish = (text: string): string =>
  text.replace(/[\u0966-\u096F\u06F0-\u06F9\u0660-\u0669]/g, toAsciiDigit).replace(/[^\u0020-\u007E]/g, "");

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  autoCapitalize = "none",
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  textContentType,
  autoComplete,
  englishOnly = false,
}: InputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => {
          if (!englishOnly) {
            onChangeText(text);
            return;
          }
          const english = toEnglish(text);
          onChangeText(isNumericKeyboard(keyboardType) ? english.replace(/[^0-9+]/g, "") : english);
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        spellCheck={false}
        keyboardType={resolveKeyboardType(keyboardType, englishOnly)}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        textContentType={textContentType}
        autoComplete={autoComplete ?? "off"}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
