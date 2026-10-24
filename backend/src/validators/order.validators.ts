import { z } from "zod";

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const PAYMENT_METHOD_VALUES = ["RAZORPAY", "COD"] as const;

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminOrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    return value;
  }, z.enum(ORDER_STATUS_VALUES).optional()),
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  paymentMethod: z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    return value;
  }, z.enum(PAYMENT_METHOD_VALUES).optional()),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
});

export const collectCodPaymentSchema = z.object({
  collected: z.literal(true),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CollectCodPaymentInput = z.infer<typeof collectCodPaymentSchema>;
