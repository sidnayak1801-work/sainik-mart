import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getMe, login as loginRequest, register as registerRequest, verifyOtp } from "@/api/auth";
import { ApiError, setOnUnauthorized } from "@/api/client";
import { registerPushForUser, subscribePushTokenRefresh, unregisterPushForUser } from "@/notifications/push";
import { removeSelectedAddressId } from "@/storage/addressStorage";
import { getToken, removeToken, setToken } from "@/storage/authStorage";
import type { AuthState, LoginRequest, OtpVerifyRequest, RegisterRequest, User } from "@/types/auth";

type AuthContextValue = AuthState & {
  login: (input: LoginRequest) => Promise<void>;
  loginWithOtp: (input: OtpVerifyRequest) => Promise<void>;
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

  useEffect(() => {
    if (!user) {
      return;
    }
    void registerPushForUser();
    const refresh = subscribePushTokenRefresh();
    return () => refresh.remove();
  }, [user]);

  const login = useCallback(async (input: LoginRequest) => {
    const result = await loginRequest(input);
    const nextUser = await persistSession(result.user, result.accessToken);
    setUser(nextUser);
  }, []);

  const loginWithOtp = useCallback(async (input: OtpVerifyRequest) => {
    const result = await verifyOtp(input);
    const nextUser = await persistSession(result.user, result.accessToken);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (input: RegisterRequest) => {
    const result = await registerRequest(input);
    const nextUser = await persistSession(result.user, result.accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await unregisterPushForUser();
    await removeToken();
    await removeSelectedAddressId();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      loginWithOtp,
      register,
      logout,
    }),
    [user, isLoading, login, loginWithOtp, register, logout],
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
