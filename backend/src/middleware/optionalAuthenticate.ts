import type { NextFunction, Request, Response } from "express";

import { loadAuthenticatedUser } from "./authenticate";
import { asyncHandler } from "./asyncHandler";

export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      next();
      return;
    }

    await loadAuthenticatedUser(req);
    next();
  },
);
