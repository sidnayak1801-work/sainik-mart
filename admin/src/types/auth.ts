export type UserRole = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
};

export type MePayload = {
  user: User;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};
