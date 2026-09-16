import type { ApiSuccess } from "@/types/auth";
import type { Pagination, Product } from "@/types/models";

import { api } from "./client";

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
};

export type ProductListResult = {
  items: Product[];
  pagination: Pagination;
};

type ProductListResponse = ApiSuccess<Product[]> & {
  pagination: Pagination;
};

const toQuery = (params: ProductListQuery): string => {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  if (params.categoryId) search.set("categoryId", params.categoryId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const listProducts = async (params: ProductListQuery = {}): Promise<ProductListResult> => {
  const response = await api.get<ProductListResponse>(`/api/products${toQuery(params)}`);
  return { items: response.data, pagination: response.pagination };
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get<ApiSuccess<Product>>(`/api/products/${id}`);
  return response.data;
};
