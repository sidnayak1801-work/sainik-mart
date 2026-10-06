import type {
  ApiSuccess,
  AuthPayload,
  LoginRequest,
  MePayload,
  OtpRequestPayload,
  OtpVerifyRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

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

export const requestOtp = async (identifier: string): Promise<OtpRequestPayload> => {
  try {
    const response = await api.post<ApiSuccess<OtpRequestPayload>>("/api/auth/otp/request", {
      identifier,
    });
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError("No account found for this email or phone.", 401, error.data);
    }
    throw error;
  }
};

export const verifyOtp = async (body: OtpVerifyRequest): Promise<AuthPayload> => {
  try {
    const response = await api.post<ApiSuccess<AuthPayload>>("/api/auth/otp/verify", body);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError("Invalid or expired code.", 401, error.data);
    }
    throw error;
  }
};

export const register = async (body: RegisterRequest): Promise<AuthPayload> => {
  const response = await api.post<ApiSuccess<AuthPayload>>("/api/auth/register", body);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiSuccess<MePayload>>("/api/auth/me");
  return response.data.user;
};
