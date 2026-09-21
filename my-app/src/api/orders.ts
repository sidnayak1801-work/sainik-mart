import type { ApiSuccess } from "@/types/auth";
import type { CreatedOrder, Order, OrderSummary, Pagination } from "@/types/models";

import { api } from "./client";

export type OrderListQuery = {
  page?: number;
  limit?: number;
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
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const createOrder = async (addressId: string): Promise<CreatedOrder> => {
  const response = await api.post<ApiSuccess<CreatedOrder>>("/api/orders", { addressId });
  return response.data;
};

export const listOrders = async (params: OrderListQuery = {}): Promise<OrderListResult> => {
  const response = await api.get<OrderListResponse>(`/api/orders${toQuery(params)}`);
  return { items: response.data, pagination: response.pagination };
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get<ApiSuccess<Order>>(`/api/orders/${id}`);
  return response.data;
};
