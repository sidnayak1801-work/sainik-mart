import { Prisma, type Role } from "@prisma/client";

import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validators";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

const canSeeInactive = (role?: Role): boolean => role === "ADMIN";

const duplicateNameError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  const target = error.meta?.target;
  const field = Array.isArray(target) && typeof target[0] === "string" ? target[0] : "name";
  return new AppError(`A category with this ${field} already exists`, 409);
};

export const listCategories = async (role?: Role) => {
  return prisma.category.findMany({
    where: canSeeInactive(role) ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });
};

export const getCategoryById = async (id: string, role?: Role) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category || (!category.isActive && !canSeeInactive(role))) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const createCategory = async (input: CreateCategoryInput) => {
  try {
    return await prisma.category.create({
      data: {
        name: input.name,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw duplicateNameError(error);
    }
    throw error;
  }
};

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  await getCategoryById(id, "ADMIN");

  try {
    return await prisma.category.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw duplicateNameError(error);
    }
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  await getCategoryById(id, "ADMIN");

  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
};
