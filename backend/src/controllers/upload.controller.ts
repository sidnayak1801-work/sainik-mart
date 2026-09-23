import type { Request, Response } from "express";

import { uploadProductImage } from "../services/upload.service";
import { AppError } from "../utils/AppError";

export const create = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError("Image file is required", 400);
  }

  const data = await uploadProductImage(req.file.buffer);
  res.status(200).json({ success: true, data });
};
