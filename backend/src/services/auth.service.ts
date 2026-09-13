import { Prisma } from "@prisma/client";

import type { PublicUser } from "../types";
import { AppError } from "../utils/AppError";
import { signAccessToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { prisma } from "../utils/prisma";
import type { RegisterInput } from "../validators/auth.validators";

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

export const login = async (identifier: string, password: string) => {
  const isEmail = identifier.includes("@");
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: identifier.toLowerCase() } : { phone: identifier },
  });

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
