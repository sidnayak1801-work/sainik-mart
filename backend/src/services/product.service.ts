import { Prisma, type Product, type Role } from "@prisma/client";

import type { CreateProductInput, ProductListQuery, UpdateProductInput } from "../validators/product.validators";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

const canSeeInactive = (role?: Role): boolean => role === "ADMIN";

const toMoney = (value: Prisma.Decimal | null): number | null => {
  if (value === null) {
    return null;
  }
  return Number(value);
};

type ProductWithCategory = Product & {
  category: { id: string; name: string };
};

const serializeProduct = (product: ProductWithCategory) => ({
  ...product,
  price: toMoney(product.price) ?? 0,
  discountPrice: toMoney(product.discountPrice),
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

const productInclude = {
  category: {
    select: { id: true, name: true },
  },
} as const;

export const listProducts = async (query: ProductListQuery, role?: Role) => {
  const { page, limit, search, categoryId } = query;
  const where: Prisma.ProductWhereInput = {
    ...(canSeeInactive(role) ? {} : { isActive: true }),
    ...(categoryId ? { categoryId } : {}),
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

  if (!product || (!product.isActive && !canSeeInactive(role))) {
    throw new AppError("Product not found", 404);
  }

  return serializeProduct(product);
};

export const createProduct = async (input: CreateProductInput) => {
  await requireCategory(input.categoryId);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      discountPrice: input.discountPrice,
      imageUrl: input.imageUrl,
      stockQuantity: input.stockQuantity ?? 0,
      categoryId: input.categoryId,
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

  const nextPrice = input.price ?? Number(existing.price);
  const nextDiscount =
    input.discountPrice !== undefined ? input.discountPrice : toMoney(existing.discountPrice);
  assertDiscountFitsPrice(nextPrice, nextDiscount);

  const product = await prisma.product.update({
    where: { id },
    data: input,
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
