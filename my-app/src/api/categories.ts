import type { ApiSuccess } from "@/types/auth";
import type { Category } from "@/types/models";

import { api } from "./client";

export const listCategories = async (): Promise<Category[]> => {
  const response = await api.get<ApiSuccess<Category[]>>("/api/categories");
  return response.data;
};

export const getCategory = async (id: string): Promise<Category> => {
  const response = await api.get<ApiSuccess<Category>>(`/api/categories/${id}`);
  return response.data;
};
