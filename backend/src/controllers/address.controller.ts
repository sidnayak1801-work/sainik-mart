import type { Request, Response } from "express";

import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from "../services/address.service";
import { AppError } from "../utils/AppError";
import { paramId } from "../utils/params";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user.id;
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const data = await listAddresses(requireUserId(req));
  res.status(200).json({ success: true, data });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await createAddress(requireUserId(req), req.body);
  res.status(201).json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const data = await updateAddress(requireUserId(req), paramId(req.params.id), req.body);
  res.status(200).json({ success: true, data });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const data = await deleteAddress(requireUserId(req), paramId(req.params.id));
  res.status(200).json({ success: true, data });
};
