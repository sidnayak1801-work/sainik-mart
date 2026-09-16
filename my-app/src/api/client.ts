import { getToken } from "@/storage/authStorage";
import { API_URL } from "@/utils/constants";

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
  if (status >= 500) return "Something went wrong. Please try again.";

  if (isErrorBody(data) && typeof data.message === "string" && isSafeUserMessage(data.message)) {
    return data.message;
  }

  if (status === 400) return "Please check your input and try again.";
  if (status >= 400) return "Please check your input and try again.";
  return "Unable to complete the request.";
};

const request = async <T>(method: HttpMethod, path: string, body?: unknown): Promise<T> => {
  if (!API_URL) {
    throw new ApiError("API URL is not configured.", 0);
  }

  const url = `${API_URL.replace(/\/$/, "")}${path}`;
  const token = await getToken();
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
    throw new ApiError("Unable to connect to the server. Please check your internet connection.", 0);
  }

  const data: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
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
