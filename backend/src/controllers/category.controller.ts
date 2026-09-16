import type { Request, Response } from "express";

import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../services/category.service";
import { paramId } from "../utils/params";

export const list = async (req: Request, res: Response): Promise<void> => {
  const data = await listCategories(req.user?.role);
  res.status(200).json({ success: true, data });
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const data = await getCategoryById(paramId(req.params.id), req.user?.role);
  res.status(200).json({ success: true, data });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await createCategory(req.body);
  res.status(201).json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const data = await updateCategory(paramId(req.params.id), req.body);
  res.status(200).json({ success: true, data });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const data = await deleteCategory(paramId(req.params.id));
  res.status(200).json({ success: true, data });
};
