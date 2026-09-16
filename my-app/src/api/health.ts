import { api } from "./client";

export type HealthResponse = {
  success: boolean;
  message: string;
  env?: string;
};

export const fetchHealth = () => api.get<HealthResponse>("/api/health");
