import type { Request, Response } from "express";

import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/product.service";
import { paramId } from "../utils/params";
import type { ProductListQuery } from "../validators/product.validators";

export const list = async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await listProducts(
    req.query as unknown as ProductListQuery,
    req.user?.role,
  );
  res.status(200).json({ success: true, data: items, pagination });
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const data = await getProductById(paramId(req.params.id), req.user?.role);
  res.status(200).json({ success: true, data });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await createProduct(req.body);
  res.status(201).json({ success: true, data });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const data = await updateProduct(paramId(req.params.id), req.body);
  res.status(200).json({ success: true, data });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const data = await deleteProduct(paramId(req.params.id));
  res.status(200).json({ success: true, data });
};
