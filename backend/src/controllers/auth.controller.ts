import type { Request, Response } from "express";

import { getMe, login, register } from "../services/auth.service";
import { AppError } from "../utils/AppError";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const result = await register(req.body);
  res.status(201).json({ success: true, data: result });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const result = await login(req.body.identifier, req.body.password);
  res.status(200).json({ success: true, data: result });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await getMe(req.user.id);
  res.status(200).json({ success: true, data: { user } });
};
