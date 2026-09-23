import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { AppError } from "../utils/AppError";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new AppError("Image must be a JPEG, PNG, or WebP file", 400));
      return;
    }
    cb(null, true);
  },
}).single("file");

export const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Image must be 5 MB or smaller", 400));
      return;
    }
    next(error instanceof AppError ? error : new AppError("Unable to process image upload", 400));
  });
};
