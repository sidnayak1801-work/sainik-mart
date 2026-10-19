import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 10;
const hits = new Map<string, number[]>();

const clientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.ip || req.socket.remoteAddress || "unknown";
};

export const resetLoginIpLimit = (): void => {
  hits.clear();
};

export const loginIpLimit = (req: Request, _res: Response, next: NextFunction): void => {
  const now = Date.now();
  const key = `${req.path}:${clientIp(req)}`;
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_PER_IP) {
    next(
      new AppError("Too many login attempts. Please wait and try again.", 429, {
        code: "LOGIN_RATE_LIMITED",
      }),
    );
    return;
  }
  recent.push(now);
  hits.set(key, recent);
  next();
};
