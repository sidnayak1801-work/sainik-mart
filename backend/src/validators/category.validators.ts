import { z } from "zod";

const optionalImageUrl = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().url().max(2048).nullable().optional(),
);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  imageUrl: optionalImageUrl,
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createSubcategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  imageUrl: optionalImageUrl,
  isActive: z.boolean().optional(),
});

export const updateSubcategorySchema = createSubcategorySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
