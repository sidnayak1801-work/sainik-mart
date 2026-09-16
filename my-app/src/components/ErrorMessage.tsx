import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme";
import { Button } from "./Button";

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Retry" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  message: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
  },
});
