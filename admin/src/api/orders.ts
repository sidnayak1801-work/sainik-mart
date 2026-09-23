import type { ApiSuccess } from "@/types/auth";
import type { OrderDetail, OrderStatus, OrderSummary, Pagination } from "@/types/models";

import { api } from "./client";

export type OrderListQuery = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
};

export type OrderListResult = {
  items: OrderSummary[];
  pagination: Pagination;
};

type OrderListResponse = ApiSuccess<OrderSummary[]> & {
  pagination: Pagination;
};

const toQuery = (params: OrderListQuery): string => {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search) search.set("search", params.search);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const listOrders = async (params: OrderListQuery = {}): Promise<OrderListResult> => {
  const response = await api.get<OrderListResponse>(`/api/admin/orders${toQuery(params)}`);
  return {
    items: response.data,
    pagination: response.pagination,
  };
};

export const getOrder = async (id: string): Promise<OrderDetail> => {
  const response = await api.get<ApiSuccess<OrderDetail>>(`/api/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<OrderDetail> => {
  const response = await api.patch<ApiSuccess<OrderDetail>>(`/api/admin/orders/${id}/status`, { status });
  return response.data;
};
