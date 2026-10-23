import type { Request, Response } from "express";

import { createSubcategory, deleteSubcategory, updateSubcategory } from "../services/subcategory.service";
import { paramId } from "../utils/params";

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await createSubcategory(paramId(req.params.id), req.body);
  res.status(201).json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const data = await updateSubcategory(paramId(req.params.id), req.body);
  res.status(200).json({ success: true, data });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const data = await deleteSubcategory(paramId(req.params.id));
  res.status(200).json({ success: true, data });
};
