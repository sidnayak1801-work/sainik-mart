import { ActivityIndicator, StyleSheet, View } from "react-native";

import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";

import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <BrandLogo size="lg" />
        <ActivityIndicator color={theme.colors.gold} />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
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
