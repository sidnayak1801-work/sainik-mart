import { z } from "zod";

const indianPincode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Pincode must be a 6-digit Indian PIN code");

export const createAddressSchema = z.object({
  addressLine: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(120),
  pincode: indianPincode,
  latitude: z.number().gte(-90).lte(90).optional(),
  longitude: z.number().gte(-180).lte(180).optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
