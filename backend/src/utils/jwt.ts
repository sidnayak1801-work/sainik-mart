import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { AccessTokenPayload, AuthUser } from "../types";

const isRole = (value: unknown): value is AccessTokenPayload["role"] => {
  return value === "CUSTOMER" || value === "ADMIN";
};

export const signAccessToken = (user: AuthUser): string => {
  const payload: AccessTokenPayload = {
    sub: user.id,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (typeof decoded === "string" || typeof decoded.sub !== "string" || !isRole(decoded.role)) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
  };
};
