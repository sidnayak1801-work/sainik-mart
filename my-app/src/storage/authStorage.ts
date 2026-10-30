import type { User, UserRole } from "@/types/auth";
import { secureStore } from "@/utils/secureStore";

const TOKEN_KEY = "sainik-mart.accessToken";
const USER_KEY = "sainik-mart.user";

const isRole = (value: unknown): value is UserRole => value === "CUSTOMER" || value === "ADMIN";

const parseUser = (raw: string | null): User | null => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<User>;
    if (
      typeof value.id !== "string" ||
      typeof value.phone !== "string" ||
      !isRole(value.role) ||
      typeof value.isVerified !== "boolean"
    ) {
      return null;
    }
    return {
      id: value.id,
      name: value.name ?? null,
      email: value.email ?? null,
      phone: value.phone,
      role: value.role,
      isVerified: value.isVerified,
      createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    };
  } catch {
    return null;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await secureStore.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await secureStore.setItem(TOKEN_KEY, token);
  } catch {
    throw new Error("Unable to save your session. Please try again.");
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await secureStore.deleteItem(TOKEN_KEY);
  } catch {
    // Logout must still clear in-memory state even if storage fails.
  }
};

export const getCachedUser = async (): Promise<User | null> => {
  try {
    return parseUser(await secureStore.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const setCachedUser = async (user: User): Promise<void> => {
  try {
    await secureStore.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Token is enough to retry /me on the next launch.
  }
};

export const removeCachedUser = async (): Promise<void> => {
  try {
    await secureStore.deleteItem(USER_KEY);
  } catch {
    // Logout must still clear in-memory state even if storage fails.
  }
};

export const clearSession = async (): Promise<void> => {
  await removeToken();
  await removeCachedUser();
};
