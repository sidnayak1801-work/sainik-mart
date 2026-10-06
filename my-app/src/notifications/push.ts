import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { registerDeviceToken, unregisterDeviceToken } from "@/api/notifications";
import { navigateToOrderDetails } from "@/navigation/navigationRef";

const ORDER_TYPES = new Set(["ORDER_CREATED", "ORDER_STATUS_UPDATED"]);

let lastToken: string | null = null;
let permissionAsked = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const canUseNativePush = (): boolean => {
  if (Platform.OS === "web") {
    return false;
  }
  return Constants.appOwnership !== "expo";
};

const platformForOs = (): "ANDROID" | "IOS" => (Platform.OS === "ios" ? "IOS" : "ANDROID");

const tokenFromDevice = (value: Notifications.DevicePushToken): string => {
  return typeof value.data === "string" ? value.data : "";
};

const dataRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as Record<string, unknown>;
};

export const orderIdFromNotificationData = (value: unknown): string | null => {
  const data = dataRecord(value);
  const type = typeof data.type === "string" ? data.type : "";
  const orderId = typeof data.orderId === "string" ? data.orderId : "";
  if (!ORDER_TYPES.has(type) || !orderId) {
    return null;
  }
  return orderId;
};

const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync("orders", {
    name: "Sainik Mart Orders",
    importance: Notifications.AndroidImportance.HIGH,
  });
};

const registerTokenValue = async (token: string): Promise<void> => {
  lastToken = token;
  await registerDeviceToken({ token, platform: platformForOs() });
};

export const registerPushForUser = async (): Promise<void> => {
  if (!canUseNativePush()) {
    return;
  }

  try {
    await ensureAndroidChannel();
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted" && !permissionAsked) {
      permissionAsked = true;
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") {
      return;
    }

    const device = await Notifications.getDevicePushTokenAsync();
    const token = tokenFromDevice(device);
    if (!token) {
      return;
    }
    await registerTokenValue(token);
  } catch {
    // Push is optional: login, cart, and checkout must keep working.
  }
};

export const unregisterPushForUser = async (): Promise<void> => {
  if (!lastToken) {
    return;
  }
  const token = lastToken;
  lastToken = null;
  try {
    await unregisterDeviceToken({ token });
  } catch {
    // Logout must still complete.
  }
};

export const subscribePushTokenRefresh = (): { remove: () => void } => {
  const subscription = Notifications.addPushTokenListener((token) => {
    if (!canUseNativePush()) {
      return;
    }
    const value = tokenFromDevice(token);
    if (!value) {
      return;
    }
    void registerTokenValue(value);
  });
  return subscription;
};

export const subscribeNotificationTaps = (): { remove: () => void } => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const orderId = orderIdFromNotificationData(response.notification.request.content.data);
    if (orderId) {
      navigateToOrderDetails(orderId);
    }
  });
  return subscription;
};

export const handleLastNotificationTap = async (): Promise<void> => {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    const orderId = orderIdFromNotificationData(response?.notification.request.content.data);
    if (orderId) {
      navigateToOrderDetails(orderId);
    }
  } catch {
    // Cold-start tap is best-effort.
  }
};
