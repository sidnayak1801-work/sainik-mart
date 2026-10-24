import "react-native-gesture-handler";

import { useEffect } from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AppNavigator } from "@/navigation/AppNavigator";
import { flushPendingNotificationNavigation, navigationRef } from "@/navigation/navigationRef";
import { handleLastNotificationTap, subscribeNotificationTaps } from "@/notifications/push";
import { theme } from "@/theme";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    primary: theme.colors.primary,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.danger,
  },
};

export default function App() {
  useEffect(() => {
    const taps = subscribeNotificationTaps();
    void handleLastNotificationTap();
    return () => taps.remove();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer
              ref={navigationRef}
              theme={navigationTheme}
              onReady={flushPendingNotificationNavigation}
            >
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
