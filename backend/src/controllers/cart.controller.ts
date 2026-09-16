import type { Request, Response } from "express";

import { addCartItem, deleteCartItem, getCart, updateCartItem } from "../services/cart.service";
import { AppError } from "../utils/AppError";
import { paramId } from "../utils/params";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user.id;
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const data = await getCart(requireUserId(req));
  res.status(200).json({ success: true, data });
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  const data = await addCartItem(requireUserId(req), req.body);
  res.status(201).json({ success: true, data });
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const data = await updateCartItem(requireUserId(req), paramId(req.params.id), req.body);
  res.status(200).json({ success: true, data });
};

export const removeItem = async (req: Request, res: Response): Promise<void> => {
  const data = await deleteCartItem(requireUserId(req), paramId(req.params.id));
  res.status(200).json({ success: true, data });
};
