import { registerDeviceToken, unregisterDeviceToken } from "@/api/notifications";

import { getFirebaseVapidKey, getFirebaseWebConfig, isFirebaseWebConfigured } from "./config";

export const FCM_WEB_TOKEN_KEY = "sainik-mart.admin.fcmWebToken";
export const PUSH_DISMISSED_KEY = "sainik-mart.admin.pushDismissed";

const SW_PATH = "/firebase-messaging-sw.js";

const canUseWebPush = (): boolean => {
  return (
    isFirebaseWebConfigured() &&
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
};

const storedToken = (): string | null => {
  try {
    return localStorage.getItem(FCM_WEB_TOKEN_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(FCM_WEB_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(FCM_WEB_TOKEN_KEY);
    }
  } catch {
    // ignore quota / private mode
  }
};

const loadMessaging = async () => {
  const [{ getApps, initializeApp }, { getMessaging, isSupported }] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ]);
  if (!(await isSupported())) {
    return null;
  }
  const app = getApps()[0] ?? initializeApp(getFirebaseWebConfig());
  return { messaging: getMessaging(app) };
};

export const enableAdminPush = async (): Promise<"granted" | "denied" | "unsupported"> => {
  if (!canUseWebPush()) {
    return "unsupported";
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return "denied";
  }

  const loaded = await loadMessaging();
  if (!loaded) {
    return "unsupported";
  }

  const { getToken } = await import("firebase/messaging");
  const registration = await navigator.serviceWorker.register(SW_PATH);
  await navigator.serviceWorker.ready;
  const token = await getToken(loaded.messaging, {
    vapidKey: getFirebaseVapidKey(),
    serviceWorkerRegistration: registration,
  });
  if (!token) {
    return "unsupported";
  }

  persistToken(token);
  await registerDeviceToken(token, "WEB");
  return "granted";
};

export const disableAdminPush = async (): Promise<void> => {
  const token = storedToken();
  if (token) {
    try {
      await unregisterDeviceToken(token);
    } catch {
      // still drop the local token so logout can finish
    }
    persistToken(null);
  }

  if (!canUseWebPush()) {
    return;
  }

  try {
    const loaded = await loadMessaging();
    if (!loaded) {
      return;
    }
    const { deleteToken } = await import("firebase/messaging");
    await deleteToken(loaded.messaging);
  } catch {
    // ignore FCM cleanup failures
  }
};

export const refreshAdminPushIfGranted = async (): Promise<void> => {
  if (!canUseWebPush() || Notification.permission !== "granted") {
    return;
  }
  await enableAdminPush();
};

export const subscribeForegroundMessages = (onOrder: (orderId: string) => void): (() => void) => {
  let unsubscribe: (() => void) | undefined;

  void (async () => {
    if (!canUseWebPush() || Notification.permission !== "granted") {
      return;
    }
    const loaded = await loadMessaging();
    if (!loaded) {
      return;
    }
    const { onMessage } = await import("firebase/messaging");
    unsubscribe = onMessage(loaded.messaging, (payload) => {
      const data = payload.data ?? {};
      const orderId = typeof data.orderId === "string" ? data.orderId : "";
      const title = payload.notification?.title ?? "New paid order";
      const body = payload.notification?.body ?? "";
      const notification = new Notification(title, { body, data: { orderId } });
      notification.onclick = () => {
        notification.close();
        window.focus();
        if (orderId) {
          onOrder(orderId);
        }
      };
    });
  })();

  return () => {
    unsubscribe?.();
  };
};
