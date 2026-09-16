import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  logger.error("Unhandled error", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" && err instanceof Error ? { details: err.message } : {}),
  });
};
