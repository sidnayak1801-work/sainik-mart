import type { ApiSuccess } from "@/types/auth";
import type { CreatedOrder } from "@/types/models";

import { api } from "./client";

export const createOrder = async (addressId: string): Promise<CreatedOrder> => {
  const response = await api.post<ApiSuccess<CreatedOrder>>("/api/orders", { addressId });
  return response.data;
};
