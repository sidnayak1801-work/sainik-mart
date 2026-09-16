import type { NextFunction, Request, Response } from "express";

import { asyncHandler } from "./asyncHandler";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../utils/prisma";

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  let userId: string;
  try {
    userId = verifyAccessToken(token).sub;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 401);
  }

  req.user = { id: user.id, role: user.role };
  next();
});
