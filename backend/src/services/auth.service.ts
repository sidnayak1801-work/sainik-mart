import { Prisma } from "@prisma/client";

import { env } from "../config/env";
import { getOtpProvider } from "../services/otp";
import { verifyMsg91AccessToken } from "../services/otp/msg91.widget";
import type { PublicUser } from "../types";
import { AppError } from "../utils/AppError";
import { signAccessToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { generateOtp, hashOtp, verifyOtpHash } from "../utils/otp";
import { hashPassword, verifyPassword } from "../utils/password";
import { maskPhone, normalizeIndianMobile } from "../utils/phone";
import { prisma } from "../utils/prisma";
import type { RegisterInput } from "../validators/auth.validators";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const toAuthResult = (user: PublicUser, isNewUser = false) => ({
  user,
  accessToken: signAccessToken({ id: user.id, role: user.role }),
  isNewUser,
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

const otpCooldownError = () =>
  new AppError("Please wait before requesting another OTP.", 429, { code: "OTP_COOLDOWN" });

const otpRateLimitedError = () =>
  new AppError("Please wait before requesting another OTP.", 429, { code: "OTP_RATE_LIMITED" });

const invalidOtpError = () =>
  new AppError("Incorrect OTP. Please try again.", 401, { code: "INVALID_OTP" });

const expiredOtpError = () =>
  new AppError("This OTP has expired. Please request a new OTP.", 401, { code: "OTP_EXPIRED" });

const attemptsExceededError = () =>
  new AppError("Too many attempts. Please request a new OTP.", 401, { code: "OTP_ATTEMPTS_EXCEEDED" });

export const register = async (input: RegisterInput) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        role: "CUSTOMER",
        isVerified: true,
      },
      select: userSelect,
    });

    return toAuthResult(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(`A user with this ${duplicateField(error.meta?.target)} already exists`, 409);
    }
    throw error;
  }
};

export const normalizeLoginIdentifier = (raw: string): { email?: string; phone?: string } => {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase() };
  }

  try {
    return { phone: normalizeIndianMobile(trimmed) };
  } catch {
    const compact = trimmed.replace(/[\s-]/g, "");
    return { phone: compact };
  }
};

const credentialsSelect = {
  ...userSelect,
  passwordHash: true,
  deletedAt: true,
} as const;

const toPublicUser = (user: {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  role: PublicUser["role"];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const findUserByIdentifier = async (identifier: string) => {
  const where = normalizeLoginIdentifier(identifier);
  if (where.email) {
    return prisma.user.findUnique({ where: { email: where.email }, select: credentialsSelect });
  }
  return prisma.user.findUnique({ where: { phone: where.phone! }, select: credentialsSelect });
};

const issueOtp = async (rawPhone: string) => {
  const phoneNumber = normalizeIndianMobile(rawPhone);
  const now = Date.now();

  const hourlyCount = await prisma.authOtp.count({
    where: {
      identifier: phoneNumber,
      createdAt: { gte: new Date(now - 60 * 60 * 1000) },
    },
  });
  if (hourlyCount >= env.OTP_MAX_REQUESTS_PER_HOUR) {
    throw otpRateLimitedError();
  }

  const latest = await prisma.authOtp.findFirst({
    where: { identifier: phoneNumber },
    orderBy: { createdAt: "desc" },
  });
  if (latest && now - latest.createdAt.getTime() < env.OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    throw otpCooldownError();
  }

  await prisma.authOtp.updateMany({
    where: { identifier: phoneNumber, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const otp = generateOtp(env.OTP_LENGTH);
  const expiresAt = new Date(now + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.authOtp.create({
    data: {
      identifier: phoneNumber,
      codeHash: hashOtp(otp),
      expiresAt,
    },
  });

  try {
    await getOtpProvider().sendOtp({ phoneNumber, otp });
  } catch (error) {
    await prisma.authOtp.updateMany({
      where: { identifier: phoneNumber, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`OTP provider failed for ${maskPhone(phoneNumber)}`, error);
    throw new AppError("We couldn't send the OTP. Please try again.", 502, {
      code: "OTP_PROVIDER_ERROR",
    });
  }

  logger.info(`OTP requested for ${maskPhone(phoneNumber)}`);
  return { message: "OTP sent successfully" };
};

export const sendOtp = async (phoneNumber: string) => issueOtp(phoneNumber);

export const resendOtp = async (phoneNumber: string) => issueOtp(phoneNumber);

export const verifyOtp = async (rawPhone: string, otp: string) => {
  const phoneNumber = normalizeIndianMobile(rawPhone);
  const now = new Date();

  const row = await prisma.authOtp.findFirst({
    where: { identifier: phoneNumber, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    logger.info(`OTP verification failed for ${maskPhone(phoneNumber)}`);
    throw invalidOtpError();
  }

  if (row.verifiedAt) {
    logger.info(`OTP verification failed for ${maskPhone(phoneNumber)}`);
    throw invalidOtpError();
  }

  if (row.expiresAt <= now) {
    await prisma.authOtp.update({
      where: { id: row.id },
      data: { consumedAt: now },
    });
    logger.info(`OTP verification failed for ${maskPhone(phoneNumber)}`);
    throw expiredOtpError();
  }

  if (row.attempts >= env.OTP_MAX_ATTEMPTS) {
    await prisma.authOtp.update({
      where: { id: row.id },
      data: { consumedAt: now },
    });
    logger.info(`OTP verification failed for ${maskPhone(phoneNumber)}`);
    throw attemptsExceededError();
  }

  if (!verifyOtpHash(otp, row.codeHash)) {
    const attempts = row.attempts + 1;
    const exceeded = attempts >= env.OTP_MAX_ATTEMPTS;
    await prisma.authOtp.update({
      where: { id: row.id },
      data: {
        attempts,
        consumedAt: exceeded ? now : undefined,
      },
    });
    logger.info(`OTP verification failed for ${maskPhone(phoneNumber)}`);
    if (exceeded) {
      throw attemptsExceededError();
    }
    throw invalidOtpError();
  }

  await prisma.authOtp.update({
    where: { id: row.id },
    data: { consumedAt: now, verifiedAt: now },
  });

  return authenticateVerifiedCustomer(phoneNumber);
};

export const verifyWidget = async (accessToken: string) => {
  const phoneNumber = await verifyMsg91AccessToken(accessToken);
  return authenticateVerifiedCustomer(phoneNumber);
};

const authenticateVerifiedCustomer = async (phoneNumber: string) => {
  const existing = await prisma.user.findFirst({
    where: { phone: phoneNumber, deletedAt: null },
    select: userSelect,
  });

  if (existing) {
    if (!existing.isVerified) {
      const verified = await prisma.user.update({
        where: { id: existing.id },
        data: { isVerified: true },
        select: userSelect,
      });
      logger.info(`OTP verification succeeded for ${maskPhone(phoneNumber)}`);
      return toAuthResult(verified, false);
    }
    logger.info(`OTP verification succeeded for ${maskPhone(phoneNumber)}`);
    return toAuthResult(existing, false);
  }

  try {
    const created = await prisma.user.create({
      data: {
        phone: phoneNumber,
        role: "CUSTOMER",
        isVerified: true,
      },
      select: userSelect,
    });
    logger.info(`OTP verification succeeded for ${maskPhone(phoneNumber)}`);
    return toAuthResult(created, true);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.user.findUnique({
        where: { phone: phoneNumber },
        select: userSelect,
      });
      if (raced) {
        logger.info(`OTP verification succeeded for ${maskPhone(phoneNumber)}`);
        return toAuthResult(raced, false);
      }
    }
    throw error;
  }
};

export const login = async (identifier: string, password: string) => {
  const user = await findUserByIdentifier(identifier);

  if (!user?.passwordHash || user.deletedAt || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError("Invalid credentials", 401);
  }

  return toAuthResult(toPublicUser(user));
};

export const loginAdmin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: credentialsSelect,
  });

  if (
    !user?.passwordHash ||
    user.deletedAt ||
    user.role !== "ADMIN" ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    throw new AppError("Invalid credentials", 401);
  }

  return toAuthResult(toPublicUser(user));
};

export const getMe = async (userId: string): Promise<PublicUser> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, phone: true, role: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "ADMIN") {
    throw new AppError("Forbidden", 403);
  }

  const tombstonePhone = `d${user.id.replace(/-/g, "").slice(0, 19)}`;

  await prisma.$transaction(async (tx) => {
    await tx.deviceToken.deleteMany({ where: { userId } });
    await tx.cart.deleteMany({ where: { userId } });
    await tx.authOtp.deleteMany({ where: { identifier: user.phone } });
    await tx.address.deleteMany({
      where: { userId, orders: { none: {} } },
    });
    await tx.address.updateMany({
      where: { userId },
      data: {
        fullName: "Deleted",
        mobile: "+910000000000",
        addressLine: "Deleted",
        city: "Deleted",
        pincode: "000000",
        latitude: null,
        longitude: null,
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        name: null,
        email: null,
        phone: tombstonePhone,
        passwordHash: null,
        isVerified: false,
        deletedAt: new Date(),
      },
    });
  });
};
