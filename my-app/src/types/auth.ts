export type UserRole = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OtpVerifyRequest = {
  phoneNumber: string;
  otp: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
  isNewUser: boolean;
};

export type MePayload = {
  user: User;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
