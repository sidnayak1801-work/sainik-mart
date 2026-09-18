import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getMe, login as loginRequest, register as registerRequest } from "@/api/auth";
import { ApiError, setOnUnauthorized } from "@/api/client";
import { getToken, removeToken, setToken } from "@/storage/authStorage";
import type { AuthState, LoginRequest, RegisterRequest, User } from "@/types/auth";

type AuthContextValue = AuthState & {
  login: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistSession = async (user: User, accessToken: string): Promise<User> => {
  await setToken(accessToken);
  return user;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => {
      void removeToken();
      setUser(null);
    });

    return () => setOnUnauthorized(null);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          return;
        }

        const currentUser = await getMe();
        setUser(currentUser);
      } catch {
        await removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(async (input: LoginRequest) => {
    const result = await loginRequest(input);
    const nextUser = await persistSession(result.user, result.accessToken);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (input: RegisterRequest) => {
    const result = await registerRequest(input);
    const nextUser = await persistSession(result.user, result.accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
};

export const toAuthErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};
