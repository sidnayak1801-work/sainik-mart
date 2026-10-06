import type { ApiSuccess } from "@/types/auth";

import { api } from "./client";

export type DevicePlatform = "ANDROID" | "IOS";

export const registerDeviceToken = async (body: {
  token: string;
  platform: DevicePlatform;
}): Promise<{ registered: true }> => {
  const response = await api.post<ApiSuccess<{ registered: true }>>(
    "/api/notifications/device-token",
    body,
  );
  return response.data;
};

export const unregisterDeviceToken = async (body: { token: string }): Promise<{ removed: true }> => {
  const response = await api.delete<ApiSuccess<{ removed: true }>>(
    "/api/notifications/device-token",
    body,
  );
  return response.data;
};
