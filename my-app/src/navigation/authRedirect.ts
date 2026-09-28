import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AuthRedirect, MainStackParamList } from "@/types/navigation";

type Navigation = NativeStackNavigationProp<MainStackParamList>;

type LoginNavigation = {
  navigate: (screen: "Login", params?: { redirect?: AuthRedirect }) => void;
};

export const continueAfterAuth = (navigation: Navigation, redirect?: AuthRedirect): void => {
  switch (redirect) {
    case "Checkout":
      navigation.replace("Checkout");
      return;
    case "AddressList":
      navigation.replace("AddressList");
      return;
    case "Orders":
      navigation.navigate("MainTabs", { screen: "Orders" });
      return;
    case "Profile":
      navigation.navigate("MainTabs", { screen: "Profile" });
      return;
    default:
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      navigation.navigate("MainTabs", { screen: "Home" });
  }
};

export const requireAuth = (
  navigation: LoginNavigation,
  isAuthenticated: boolean,
  redirect: AuthRedirect,
): boolean => {
  if (isAuthenticated) return true;
  navigation.navigate("Login", { redirect });
  return false;
};
