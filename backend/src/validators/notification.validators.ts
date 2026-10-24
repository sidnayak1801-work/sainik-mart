import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
  token: z.string().trim().min(1).max(512),
  platform: z.enum(["ANDROID", "IOS", "WEB"]),
});

export const removeDeviceTokenSchema = z.object({
  token: z.string().trim().min(1).max(512),
});

export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
export type RemoveDeviceTokenInput = z.infer<typeof removeDeviceTokenSchema>;
