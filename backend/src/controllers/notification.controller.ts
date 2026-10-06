import type { Request, Response } from "express";

import { registerDeviceToken, removeDeviceToken } from "../services/notification.service";
import { AppError } from "../utils/AppError";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user.id;
};

export const registerToken = async (req: Request, res: Response): Promise<void> => {
  const data = await registerDeviceToken(requireUserId(req), req.body.token, req.body.platform);
  res.status(200).json({ success: true, data });
};

export const removeToken = async (req: Request, res: Response): Promise<void> => {
  const data = await removeDeviceToken(requireUserId(req), req.body.token);
  res.status(200).json({ success: true, data });
};
