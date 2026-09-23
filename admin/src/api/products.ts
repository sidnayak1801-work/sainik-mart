import type { ApiSuccess } from "@/types/auth";
import type { Pagination, Product, StockStatus } from "@/types/models";

import { api } from "./client";

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  stockStatus?: StockStatus;
};

export type ProductListResult = {
  items: Product[];
  pagination: Pagination;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string | null;
  stockQuantity: number;
  categoryId: string;
  isActive: boolean;
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
  if (params.isActive !== undefined) search.set("isActive", String(params.isActive));
  if (params.stockStatus) search.set("stockStatus", params.stockStatus);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const listProducts = async (params: ProductListQuery = {}): Promise<ProductListResult> => {
  const response = await api.get<ProductListResponse>(`/api/products${toQuery(params)}`);
  return {
    items: response.data,
    pagination: response.pagination,
  };
};

export const createProduct = async (input: ProductInput): Promise<Product> => {
  const response = await api.post<ApiSuccess<Product>>("/api/products", input);
  return response.data;
};

export const updateProduct = async (
  id: string,
  input: Partial<ProductInput> & { stockQuantity?: number; isActive?: boolean },
): Promise<Product> => {
  const response = await api.patch<ApiSuccess<Product>>(`/api/products/${id}`, input);
  return response.data;
};

export const deactivateProduct = async (id: string): Promise<Product> => {
  const response = await api.delete<ApiSuccess<Product>>(`/api/products/${id}`);
  return response.data;
};
