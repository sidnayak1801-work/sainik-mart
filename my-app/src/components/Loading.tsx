import { ActivityIndicator, StyleSheet, View } from "react-native";

import { theme } from "@/theme";

export function Loading() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
});
