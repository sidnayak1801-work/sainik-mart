import type { Role } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUser = {
  id: string;
  role: Role;
};

export type AccessTokenPayload = {
  sub: string;
  role: Role;
};
