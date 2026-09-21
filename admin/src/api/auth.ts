import type { ApiSuccess, AuthPayload, LoginRequest, MePayload, User } from "@/types/auth";

import { api, ApiError } from "./client";

export const login = async (body: LoginRequest): Promise<AuthPayload> => {
  try {
    const response = await api.post<ApiSuccess<AuthPayload>>("/api/auth/login", body);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError("Invalid email or password.", 401, error.data);
    }
    throw error;
  }
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiSuccess<MePayload>>("/api/auth/me");
  return response.data.user;
};
