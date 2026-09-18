import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_PORT = "4000";

const configuredUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

const metroHostname = (): string | undefined => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return undefined;
  }

  try {
    if (hostUri.includes("://")) {
      return new URL(hostUri).hostname;
    }
    return hostUri.split(":")[0];
  } catch {
    return hostUri.split(":")[0];
  }
};

const isLoopbackUrl = (url: string): boolean => {
  return url.includes("127.0.0.1") || url.includes("localhost") || url.includes("YOUR_LAN_IP");
};

const resolveApiUrl = (): string => {
  if (Platform.OS === "web") {
    return configuredUrl || `http://127.0.0.1:${DEFAULT_PORT}`;
  }

  const host = metroHostname();
  if (host && (!configuredUrl || isLoopbackUrl(configuredUrl))) {
    const port = configuredUrl.match(/:(\d+)$/)?.[1] ?? DEFAULT_PORT;
    return `http://${host}:${port}`;
  }

  return configuredUrl;
};

export const API_URL = resolveApiUrl();

export const APP_NAME = "Sainik Mart";
export const APP_TAGLINE = "Har zaroorat, ek jagah";
