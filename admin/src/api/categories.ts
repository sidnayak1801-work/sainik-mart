import type { ApiSuccess } from "@/types/auth";
import type { Category } from "@/types/models";

import { api } from "./client";

export type CategoryInput = {
  name: string;
};

export const listCategories = async (): Promise<Category[]> => {
  const response = await api.get<ApiSuccess<Category[]>>("/api/categories");
  return response.data;
};

export const createCategory = async (input: CategoryInput): Promise<Category> => {
  const response = await api.post<ApiSuccess<Category>>("/api/categories", input);
  return response.data;
};

export const updateCategory = async (id: string, input: { name?: string; isActive?: boolean }): Promise<Category> => {
  const response = await api.patch<ApiSuccess<Category>>(`/api/categories/${id}`, input);
  return response.data;
};

export const deactivateCategory = async (id: string): Promise<Category> => {
  const response = await api.delete<ApiSuccess<Category>>(`/api/categories/${id}`);
  return response.data;
};
