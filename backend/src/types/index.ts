import type { Role } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
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
