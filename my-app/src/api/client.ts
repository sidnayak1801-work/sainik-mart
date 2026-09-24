import { getToken } from "@/storage/authStorage";
import { API_URL } from "@/utils/constants";

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export const setOnUnauthorized = (handler: UnauthorizedHandler | null): void => {
  onUnauthorized = handler;
};

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ErrorBody = {
  success?: boolean;
  message?: string;
};

const isErrorBody = (value: unknown): value is ErrorBody => {
  return typeof value === "object" && value !== null;
};

const isSafeUserMessage = (message: string): boolean => {
  const lower = message.toLowerCase();
  if (message.length > 180) return false;
  if (lower.includes("prisma") || lower.includes("stack") || lower.includes("sql")) return false;
  if (lower.includes("internal server")) return false;
  return true;
};

const userMessageForStatus = (status: number, data: unknown): string => {
  if (status === 401) return "Please sign in again.";
  if (status === 403) return "You do not have access to this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "An account with this email or phone already exists.";
  if (status === 501) {
    if (isErrorBody(data) && typeof data.message === "string" && isSafeUserMessage(data.message)) {
      return data.message;
    }
    return "Something went wrong. Please try again.";
  }
  if (status >= 500) return "Something went wrong. Please try again.";

  if (isErrorBody(data) && typeof data.message === "string" && isSafeUserMessage(data.message)) {
    return data.message;
  }

  if (status === 400) return "Please check your input and try again.";
  if (status >= 400) return "Please check your input and try again.";
  return "Unable to complete the request.";
};

const isPublicAuthPath = (path: string): boolean => {
  return path.startsWith("/api/auth/register") || path.startsWith("/api/auth/login");
};

const request = async <T>(method: HttpMethod, path: string, body?: unknown): Promise<T> => {
  if (!API_URL || API_URL.includes("YOUR_LAN_IP")) {
    throw new ApiError(
      "API URL is not configured. Set EXPO_PUBLIC_API_URL in my-app/.env and restart Expo. Start the API with npm run api from the repo root.",
      0,
    );
  }

  const url = `${API_URL.replace(/\/$/, "")}${path}`;
  const token = isPublicAuthPath(path) ? null : await getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Unable to reach the API. Start it with npm run api from the repo root, then retry.",
      0,
    );
  }

  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    if (response.status === 401 && token) {
      onUnauthorized?.();
    }
    throw new ApiError(userMessageForStatus(response.status, data), response.status, data);
  }

  return data as T;
};

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
