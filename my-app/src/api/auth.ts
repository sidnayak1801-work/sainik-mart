import type { ApiSuccess, AuthPayload, MePayload, OtpVerifyRequest, User } from "@/types/auth";

import { api, ApiError } from "./client";

export const sendOtp = async (phoneNumber: string): Promise<{ message: string }> => {
  const response = await api.post<ApiSuccess<{ message: string }>>("/api/auth/send-otp", {
    phoneNumber,
  });
  return response.data;
};

export const resendOtp = async (phoneNumber: string): Promise<{ message: string }> => {
  const response = await api.post<ApiSuccess<{ message: string }>>("/api/auth/resend-otp", {
    phoneNumber,
  });
  return response.data;
};

export const verifyOtp = async (body: OtpVerifyRequest): Promise<AuthPayload> => {
  const response = await api.post<ApiSuccess<AuthPayload>>("/api/auth/verify-otp", body);
  return response.data;
};

export const verifyWidget = async (accessToken: string): Promise<AuthPayload> => {
  const response = await api.post<ApiSuccess<AuthPayload>>("/api/auth/verify-widget", {
    accessToken,
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post<ApiSuccess<{ loggedOut: true }>>("/api/auth/logout");
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) {
      return;
    }
    throw error;
  }
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiSuccess<MePayload>>("/api/auth/me");
  return response.data.user;
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete<ApiSuccess<{ deleted: true }>>("/api/auth/account");
};
