import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError";

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };

/** Use after authenticate on admin routes: authenticate, requireAdmin */
export const requireAdmin = requireRole("ADMIN");
