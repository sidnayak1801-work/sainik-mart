import { Prisma, type Product, type Role } from "@prisma/client";

import type { CreateProductInput, ProductListQuery, UpdateProductInput } from "../validators/product.validators";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

const canSeeInactive = (role?: Role): boolean => role === "ADMIN";

export const LOW_STOCK_THRESHOLD = 5;

const stockStatusWhere = (status: ProductListQuery["stockStatus"]): Prisma.IntFilter | number | undefined => {
  if (status === "out") return 0;
  if (status === "low") return { gt: 0, lte: LOW_STOCK_THRESHOLD };
  if (status === "in") return { gt: LOW_STOCK_THRESHOLD };
  return undefined;
};

const toMoney = (value: Prisma.Decimal | null): number | null => {
  if (value === null) {
    return null;
  }
  return Number(value);
};

type ProductWithCategory = Product & {
  category: { id: string; name: string; isActive: boolean };
  subcategory: { id: string; name: string } | null;
};

const serializeProduct = (product: ProductWithCategory) => ({
  ...product,
  price: toMoney(product.price) ?? 0,
  discountPrice: toMoney(product.discountPrice),
  packQuantity: toMoney(product.packQuantity),
  category: {
    id: product.category.id,
    name: product.category.name,
  },
  subcategory: product.subcategory
    ? { id: product.subcategory.id, name: product.subcategory.name }
    : null,
});

const assertDiscountFitsPrice = (price: number, discountPrice: number | null): void => {
  if (discountPrice !== null && discountPrice > price) {
    throw new AppError("discountPrice cannot exceed price", 400);
  }
};

const requireCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }
};

const assertSubcategory = async (categoryId: string, subcategoryId: string) => {
  const subcategory = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    select: { id: true, categoryId: true },
  });

  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }

  if (subcategory.categoryId !== categoryId) {
    throw new AppError("Subcategory does not belong to this category", 400);
  }
};

const productInclude = {
  category: {
    select: { id: true, name: true, isActive: true },
  },
  subcategory: {
    select: { id: true, name: true },
  },
} as const;

export const listProducts = async (query: ProductListQuery, role?: Role) => {
  const { page, limit, search, categoryId, subcategoryId, isActive, stockStatus } = query;
  const admin = canSeeInactive(role);
  const stockFilter = admin ? stockStatusWhere(stockStatus) : undefined;
  const where: Prisma.ProductWhereInput = {
    ...(admin ? {} : { isActive: true, category: { isActive: true } }),
    ...(admin && isActive !== undefined ? { isActive } : {}),
    ...(stockFilter !== undefined ? { stockQuantity: stockFilter } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(subcategoryId ? { subcategoryId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string, role?: Role) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (
    !product ||
    (!canSeeInactive(role) && (!product.isActive || !product.category.isActive))
  ) {
    throw new AppError("Product not found", 404);
  }

  return serializeProduct(product);
};

export const createProduct = async (input: CreateProductInput) => {
  await requireCategory(input.categoryId);
  if (input.subcategoryId) {
    await assertSubcategory(input.categoryId, input.subcategoryId);
  }

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      discountPrice: input.discountPrice,
      imageUrl: input.imageUrl,
      stockQuantity: input.stockQuantity ?? 0,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId ?? null,
      packQuantity: input.packQuantity ?? null,
      packUnit: input.packUnit ?? null,
      isActive: input.isActive ?? true,
    },
    include: productInclude,
  });

  return serializeProduct(product);
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Product not found", 404);
  }

  if (input.categoryId) {
    await requireCategory(input.categoryId);
  }

  const nextCategoryId = input.categoryId ?? existing.categoryId;
  const categoryChanged = Boolean(input.categoryId && input.categoryId !== existing.categoryId);
  const nextSubcategoryId =
    input.subcategoryId !== undefined
      ? input.subcategoryId
      : categoryChanged
        ? null
        : existing.subcategoryId;

  if (nextSubcategoryId) {
    await assertSubcategory(nextCategoryId, nextSubcategoryId);
  }

  const nextPrice = input.price ?? Number(existing.price);
  const nextDiscount =
    input.discountPrice !== undefined ? input.discountPrice : toMoney(existing.discountPrice);
  assertDiscountFitsPrice(nextPrice, nextDiscount);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...input,
      subcategoryId: nextSubcategoryId,
    },
    include: productInclude,
  });

  return serializeProduct(product);
};

export const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Product not found", 404);
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: productInclude,
  });

  return serializeProduct(product);
};
