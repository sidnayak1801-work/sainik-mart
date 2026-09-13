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

declare global {
  // Express request augmentation requires a namespace merge.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
