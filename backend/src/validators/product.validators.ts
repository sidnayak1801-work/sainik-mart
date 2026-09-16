import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  imageUrl: z.string().url().max(2048).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  categoryId: z.string().uuid(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
