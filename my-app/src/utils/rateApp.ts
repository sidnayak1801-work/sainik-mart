import { Alert, Linking, Platform } from "react-native";

import { ANDROID_STORE_URL, APP_NAME, IOS_STORE_URL } from "@/utils/constants";

export const promptRateApp = (): void => {
  const url = Platform.OS === "ios" ? IOS_STORE_URL : ANDROID_STORE_URL;
  if (url) {
    Alert.alert(`Rate ${APP_NAME}`, "Enjoying the app? Rate us on the store.", [
      { text: "Not now", style: "cancel" },
      {
        text: "Rate",
        onPress: () => {
          void Linking.openURL(url);
        },
      },
    ]);
    return;
  }

  Alert.alert(
    `Rate ${APP_NAME}`,
    `Thanks for wanting to rate us. ${APP_NAME} is not listed on the store yet.`,
  );
};
