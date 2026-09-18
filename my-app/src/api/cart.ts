import type { ApiSuccess } from "@/types/auth";
import type { Cart } from "@/types/models";

import { api } from "./client";

export const getCart = async (): Promise<Cart> => {
  const response = await api.get<ApiSuccess<Cart>>("/api/cart");
  return response.data;
};

export const addCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  const response = await api.post<ApiSuccess<Cart>>("/api/cart/items", { productId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const response = await api.patch<ApiSuccess<Cart>>(`/api/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const deleteCartItem = async (itemId: string): Promise<Cart> => {
  const response = await api.delete<ApiSuccess<Cart>>(`/api/cart/items/${itemId}`);
  return response.data;
};
