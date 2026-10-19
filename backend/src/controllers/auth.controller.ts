import type { Request, Response } from "express";

import {
  deleteAccount,
  getMe,
  login,
  loginAdmin,
  register,
  resendOtp,
  sendOtp,
  verifyOtp,
  verifyWidget,
} from "../services/auth.service";
import { AppError } from "../utils/AppError";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const result = await register(req.body);
  res.status(201).json({ success: true, data: result });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const result = await login(req.body.identifier, req.body.password);
  res.status(200).json({ success: true, data: result });
};

export const loginAdminUser = async (req: Request, res: Response): Promise<void> => {
  const result = await loginAdmin(req.body.email, req.body.password);
  res.status(200).json({ success: true, data: result });
};

export const sendOtpCode = async (req: Request, res: Response): Promise<void> => {
  const result = await sendOtp(req.body.phoneNumber);
  res.status(200).json({ success: true, data: result });
};

export const resendOtpCode = async (req: Request, res: Response): Promise<void> => {
  const result = await resendOtp(req.body.phoneNumber);
  res.status(200).json({ success: true, data: result });
};

export const verifyOtpCode = async (req: Request, res: Response): Promise<void> => {
  const result = await verifyOtp(req.body.phoneNumber, req.body.otp);
  res.status(200).json({ success: true, data: result });
};

export const verifyWidgetToken = async (req: Request, res: Response): Promise<void> => {
  const result = await verifyWidget(req.body.accessToken);
  res.status(200).json({ success: true, data: result });
};

export const logoutUser = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, data: { loggedOut: true } });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await getMe(req.user.id);
  res.status(200).json({ success: true, data: { user } });
};

export const deleteCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  await deleteAccount(req.user.id);
  res.status(200).json({ success: true, data: { deleted: true } });
};
