import type { NextFunction, Request, Response } from "express";

import { loadAuthenticatedUser } from "./authenticate";
import { asyncHandler } from "./asyncHandler";
import { AppError } from "../utils/AppError";

export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next();
      return;
    }

    try {
      await loadAuthenticatedUser(req);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 401) {
        req.user = undefined;
        next();
        return;
      }
      throw error;
    }

    next();
  },
);
