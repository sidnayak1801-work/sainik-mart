import type { ApiSuccess } from "@/types/auth";

import { api } from "./client";

export type DevicePlatform = "ANDROID" | "IOS" | "WEB";

export const registerDeviceToken = async (token: string, platform: DevicePlatform): Promise<void> => {
  await api.post<ApiSuccess<{ registered: true }>>("/api/notifications/device-token", {
    token,
    platform,
  });
};

export const unregisterDeviceToken = async (token: string): Promise<void> => {
  await api.delete<ApiSuccess<{ removed: true }>>("/api/notifications/device-token", { token });
};
