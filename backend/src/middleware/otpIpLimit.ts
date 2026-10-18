import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 60;
const hits = new Map<string, number[]>();

const clientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.ip || req.socket.remoteAddress || "unknown";
};

export const otpIpLimit = (req: Request, _res: Response, next: NextFunction): void => {
  const now = Date.now();
  const key = `${req.path}:${clientIp(req)}`;
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_PER_IP) {
    next(
      new AppError("Please wait before requesting another OTP.", 429, {
        code: "OTP_RATE_LIMITED",
      }),
    );
    return;
  }
  recent.push(now);
  hits.set(key, recent);
  next();
};
