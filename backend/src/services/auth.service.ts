import { randomInt } from "node:crypto";

import { Prisma } from "@prisma/client";

import { env } from "../config/env";
import type { PublicUser } from "../types";
import { AppError } from "../utils/AppError";
import { signAccessToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { prisma } from "../utils/prisma";
import type { RegisterInput } from "../validators/auth.validators";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_EXPIRES_IN_SEC = 600;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

const toAuthResult = (user: PublicUser) => ({
  user,
  accessToken: signAccessToken({ id: user.id, role: user.role }),
});

const duplicateField = (target: unknown): string => {
  if (Array.isArray(target) && typeof target[0] === "string") {
    return target[0];
  }
  if (typeof target === "string") {
    return target;
  }
  return "account";
};

export const register = async (input: RegisterInput) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        role: "CUSTOMER",
      },
      select: userSelect,
    });

    return toAuthResult(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(
        `A user with this ${duplicateField(error.meta?.target)} already exists`,
        409,
      );
    }
    throw error;
  }
};

export const normalizeLoginIdentifier = (raw: string): { email?: string; phone?: string } => {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase() };
  }

  const compact = trimmed.replace(/[\s-]/g, "");
  if (INDIAN_MOBILE.test(compact)) {
    return { phone: `+91${compact}` };
  }

  return { phone: compact };
};

export const toOtpRequestData = (
  expiresInSec: number,
  code: string,
  nodeEnv: typeof env.NODE_ENV = env.NODE_ENV,
) => ({
  expiresInSec,
  ...(nodeEnv !== "production" ? { devCode: code } : {}),
});

const findUserByIdentifier = async (identifier: string) => {
  const where = normalizeLoginIdentifier(identifier);
  return prisma.user.findUnique({
    where: where.email ? { email: where.email } : { phone: where.phone! },
  });
};

export const requestOtp = async (identifier: string) => {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const lookup = normalizeLoginIdentifier(identifier);
  const otpIdentifier = lookup.email ?? lookup.phone!;

  const latest = await prisma.authOtp.findFirst({
    where: { identifier: otpIdentifier, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (latest && Date.now() - latest.createdAt.getTime() < OTP_COOLDOWN_MS) {
    throw new AppError("Please wait before requesting another code", 429);
  }

  await prisma.authOtp.updateMany({
    where: { identifier: otpIdentifier, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.authOtp.create({
    data: {
      identifier: otpIdentifier,
      codeHash: await hashPassword(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return toOtpRequestData(OTP_EXPIRES_IN_SEC, code);
};

export const verifyOtp = async (identifier: string, code: string) => {
  const lookup = normalizeLoginIdentifier(identifier);
  const otpIdentifier = lookup.email ?? lookup.phone!;

  const row = await prisma.authOtp.findFirst({
    where: { identifier: otpIdentifier, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    throw new AppError("Invalid credentials", 401);
  }

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.authOtp.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    });
    throw new AppError("Invalid credentials", 401);
  }

  const matched = await verifyPassword(code, row.codeHash);
  if (!matched) {
    const attempts = row.attempts + 1;
    await prisma.authOtp.update({
      where: { id: row.id },
      data: {
        attempts,
        consumedAt: attempts >= OTP_MAX_ATTEMPTS ? new Date() : undefined,
      },
    });
    throw new AppError("Invalid credentials", 401);
  }

  await prisma.authOtp.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });

  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return toAuthResult(publicUser);
};

export const login = async (identifier: string, password: string) => {
  const user = await findUserByIdentifier(identifier);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError("Invalid credentials", 401);
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return toAuthResult(publicUser);
};

export const getMe = async (userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
