import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});
