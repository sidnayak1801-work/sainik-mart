import type { ApiSuccess } from "@/types/auth";
import type { Subcategory } from "@/types/models";

import { api } from "./client";

export type SubcategoryInput = {
  name: string;
  imageUrl?: string | null;
  isActive?: boolean;
};

export const createSubcategory = async (categoryId: string, input: SubcategoryInput): Promise<Subcategory> => {
  const response = await api.post<ApiSuccess<Subcategory>>(`/api/categories/${categoryId}/subcategories`, input);
  return response.data;
};

export const updateSubcategory = async (id: string, input: Partial<SubcategoryInput>): Promise<Subcategory> => {
  const response = await api.patch<ApiSuccess<Subcategory>>(`/api/subcategories/${id}`, input);
  return response.data;
};

export const deactivateSubcategory = async (id: string): Promise<Subcategory> => {
  const response = await api.delete<ApiSuccess<Subcategory>>(`/api/subcategories/${id}`);
  return response.data;
};
