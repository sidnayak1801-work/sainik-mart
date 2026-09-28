import { ActivityIndicator, StyleSheet, View } from "react-native";

import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";

import { MainNavigator } from "./MainNavigator";

export function AppNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <BrandLogo size="lg" />
        <ActivityIndicator color={theme.colors.gold} />
      </View>
    );
  }

  return <MainNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primaryDark,
    gap: theme.spacing.lg,
  },
});
