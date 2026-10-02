import type { ApiSuccess } from "@/types/auth";
import type { CreatedOrder } from "@/types/models";

import { api } from "./client";

export type VerifyPaymentInput = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export const verifyPayment = async (input: VerifyPaymentInput): Promise<CreatedOrder> => {
  const response = await api.post<ApiSuccess<CreatedOrder>>("/api/payments/verify", input);
  return response.data;
};
