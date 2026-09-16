import { z } from "zod";

export const createAddressSchema = z.object({
  addressLine: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(120),
  pincode: z.string().trim().min(4).max(10),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();
