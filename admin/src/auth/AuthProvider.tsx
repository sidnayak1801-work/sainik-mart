import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { getMe, login as loginRequest } from "@/api/auth";
import { ApiError, setOnUnauthorized } from "@/api/client";
import { AuthContext, type AuthContextValue } from "@/auth/context";
import { clearToken, getToken, setToken } from "@/storage/token";

const sessionMessage = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 0) {
    return error.message;
  }
  return "Unable to verify your session. Please try again.";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setSessionError(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setSessionError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSessionError(null);
    try {
      const currentUser = await getMe();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearToken();
        setUser(null);
        setSessionError(null);
      } else {
        setSessionError(sessionMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    setSessionError(null);
    const result = await loginRequest({ identifier, password });
    setToken(result.accessToken);
    try {
      const currentUser = await getMe();
      setUser(currentUser);
    } catch (error) {
      clearToken();
      setUser(null);
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "ADMIN",
      sessionError,
      login,
      logout,
      retrySession: restoreSession,
    }),
    [user, isLoading, sessionError, login, logout, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
