import { z } from "zod";

const money = z.number().min(0);

export const PACK_UNITS = ["ML", "L", "G", "KG", "PCS", "PACK", "DOZEN", "BUNCH"] as const;

const packUnit = z.enum(PACK_UNITS);

const packPairRefine = <T extends { packQuantity?: number | null; packUnit?: (typeof PACK_UNITS)[number] | null }>(
  value: T,
): boolean => {
  const hasQuantity = value.packQuantity !== undefined && value.packQuantity !== null;
  const hasUnit = value.packUnit !== undefined && value.packUnit !== null;
  if (value.packQuantity === null && value.packUnit === null) return true;
  return hasQuantity === hasUnit;
};

const optionalImageUrl = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().url().max(2048).nullable().optional(),
);

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1).max(180),
    description: z.string().trim().min(1),
    price: money,
    discountPrice: money.optional(),
    imageUrl: optionalImageUrl,
    stockQuantity: z.number().int().min(0).optional(),
    categoryId: z.string().uuid(),
    subcategoryId: z.string().uuid().nullable().optional(),
    packQuantity: z.number().positive().nullable().optional(),
    packUnit: packUnit.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.discountPrice === undefined || value.discountPrice <= value.price, {
    message: "discountPrice cannot exceed price",
    path: ["discountPrice"],
  })
  .refine(packPairRefine, {
    message: "packQuantity and packUnit are required together",
    path: ["packUnit"],
  });

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(180).optional(),
    description: z.string().trim().min(1).optional(),
    price: money.optional(),
    discountPrice: money.optional(),
    imageUrl: optionalImageUrl,
    stockQuantity: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().nullable().optional(),
    packQuantity: z.number().positive().nullable().optional(),
    packUnit: packUnit.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })
  .refine(packPairRefine, {
    message: "packQuantity and packUnit are required together",
    path: ["packUnit"],
  });

const optionalBooleanQuery = z.preprocess((value) => {
  if (value === undefined || value === "") return undefined;
  return value;
}, z.enum(["true", "false"]).optional());

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  isActive: optionalBooleanQuery.transform((value) =>
    value === undefined ? undefined : value === "true",
  ),
  stockStatus: z.preprocess((value) => {
    if (value === undefined || value === "") return undefined;
    return value;
  }, z.enum(["in", "low", "out"]).optional()),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
