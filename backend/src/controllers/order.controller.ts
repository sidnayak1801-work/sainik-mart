import type { Request, Response } from "express";

import {
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../services/order.service";
import { AppError } from "../utils/AppError";
import { paramId } from "../utils/params";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }
  return req.user.id;
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await createOrder(requireUserId(req), req.body);
  res.status(201).json({ success: true, data });
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const data = await listOrders(requireUserId(req));
  res.status(200).json({ success: true, data });
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const data = await getOrderById(requireUserId(req), paramId(req.params.id));
  res.status(200).json({ success: true, data });
};

export const cancel = async (req: Request, res: Response): Promise<void> => {
  const data = await cancelOrder(requireUserId(req), paramId(req.params.id));
  res.status(200).json({ success: true, data });
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const data = await updateOrderStatus(paramId(req.params.id), req.body.status);
  res.status(200).json({ success: true, data });
};
