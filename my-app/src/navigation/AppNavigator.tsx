import { StyleSheet, View } from "react-native";

import { Loading } from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/theme";

import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Loading />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
});
