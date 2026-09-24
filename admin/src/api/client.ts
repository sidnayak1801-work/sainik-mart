import { getToken } from "@/storage/token";

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

const apiBaseUrl = (): string => {
  const value = import.meta.env.VITE_API_URL ?? "";
  return value.replace(/\/$/, "");
};

const resolveBaseUrl = (): string => {
  const base = apiBaseUrl();
  if (!base) {
    throw new ApiError(
      "API URL is not configured. Set VITE_API_URL in admin/.env and restart the admin app.",
      0,
    );
  }
  return base;
};

const parseResponse = async <T>(response: Response, token: string | null): Promise<T> => {
  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    if (response.status === 401 && token) {
      onUnauthorized?.();
    }
    throw new ApiError(userMessageForStatus(response.status, data), response.status, data);
  }

  return data as T;
};

const request = async <T>(method: HttpMethod, path: string, body?: unknown): Promise<T> => {
  const base = resolveBaseUrl();
  const url = `${base}${path}`;
  const token = isPublicAuthPath(path) ? null : getToken();
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
    throw new ApiError("Unable to reach the API. Start it with npm run api from the repo root, then retry.", 0);
  }

  return parseResponse<T>(response, token);
};

const requestForm = async <T>(path: string, body: FormData): Promise<T> => {
  const base = resolveBaseUrl();
  const url = `${base}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
  } catch {
    throw new ApiError("Unable to reach the API. Start it with npm run api from the repo root, then retry.", 0);
  }

  return parseResponse<T>(response, token);
};

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  postForm: <T>(path: string, body: FormData) => requestForm<T>(path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
