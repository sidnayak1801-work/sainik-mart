import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { deleteAccount as deleteAccountRequest, getMe, logout as logoutRequest, verifyWidget } from "@/api/auth";
import { ApiError, setOnUnauthorized } from "@/api/client";
import { registerPushForUser, subscribePushTokenRefresh, unregisterPushForUser } from "@/notifications/push";
import { removeSelectedAddressId } from "@/storage/addressStorage";
import { getToken, removeToken, setToken } from "@/storage/authStorage";
import type { AuthState, User } from "@/types/auth";

type AuthContextValue = AuthState & {
  loginWithWidgetToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
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

  const loginWithWidgetToken = useCallback(async (accessToken: string) => {
    const result = await verifyWidget(accessToken);
    const nextUser = await persistSession(result.user, result.accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await unregisterPushForUser();
    try {
      await logoutRequest();
    } catch {
      // Client session must still clear if the network call fails.
    }
    await removeToken();
    await removeSelectedAddressId();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await unregisterPushForUser();
    await deleteAccountRequest();
    await removeToken();
    await removeSelectedAddressId();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      loginWithWidgetToken,
      logout,
      deleteAccount,
    }),
    [user, isLoading, loginWithWidgetToken, logout, deleteAccount],
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

const OTP_MESSAGES: Record<string, string> = {
  INVALID_PHONE_NUMBER: "Please enter a valid mobile number.",
  OTP_SEND_FAILED: "We couldn't send the OTP. Please try again.",
  OTP_PROVIDER_ERROR: "We couldn't send the OTP. Please try again.",
  OTP_RATE_LIMITED: "Please wait before requesting another OTP.",
  OTP_COOLDOWN: "Please wait before requesting another OTP.",
  INVALID_OTP: "Incorrect OTP. Please try again.",
  OTP_EXPIRED: "This OTP has expired. Please request a new OTP.",
  OTP_ATTEMPTS_EXCEEDED: "Too many attempts. Please request a new OTP.",
};

export const toAuthErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.data && typeof error.data === "object" && "code" in error.data) {
      const code = (error.data as { code?: string }).code;
      if (code && OTP_MESSAGES[code]) {
        return OTP_MESSAGES[code];
      }
    }
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};
