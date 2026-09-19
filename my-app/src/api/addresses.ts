import type { ApiSuccess } from "@/types/auth";
import type { Address, AddressInput, AddressUpdateInput } from "@/types/models";

import { api } from "./client";

export const listAddresses = async (): Promise<Address[]> => {
  const response = await api.get<ApiSuccess<Address[]>>("/api/addresses");
  return response.data;
};

export const createAddress = async (input: AddressInput): Promise<Address> => {
  const response = await api.post<ApiSuccess<Address>>("/api/addresses", input);
  return response.data;
};

export const updateAddress = async (id: string, input: AddressUpdateInput): Promise<Address> => {
  const response = await api.patch<ApiSuccess<Address>>(`/api/addresses/${id}`, input);
  return response.data;
};

export const deleteAddress = async (id: string): Promise<Address> => {
  const response = await api.delete<ApiSuccess<Address>>(`/api/addresses/${id}`);
  return response.data;
};
