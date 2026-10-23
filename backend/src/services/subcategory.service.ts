import { Prisma } from "@prisma/client";

import { getCategoryById } from "./category.service";
import type { CreateSubcategoryInput, UpdateSubcategoryInput } from "../validators/category.validators";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

const duplicateNameError = (): AppError =>
  new AppError("A subcategory with this name already exists in this category", 409);

export const getSubcategoryById = async (id: string) => {
  const subcategory = await prisma.subcategory.findUnique({ where: { id } });
  if (!subcategory) {
    throw new AppError("Subcategory not found", 404);
  }
  return subcategory;
};

export const createSubcategory = async (categoryId: string, input: CreateSubcategoryInput) => {
  await getCategoryById(categoryId, "ADMIN");

  try {
    return await prisma.subcategory.create({
      data: {
        categoryId,
        name: input.name,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw duplicateNameError();
    }
    throw error;
  }
};

export const updateSubcategory = async (id: string, input: UpdateSubcategoryInput) => {
  await getSubcategoryById(id);

  try {
    return await prisma.subcategory.update({
      where: { id },
      data: input,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw duplicateNameError();
    }
    throw error;
  }
};

export const deleteSubcategory = async (id: string) => {
  await getSubcategoryById(id);

  return prisma.subcategory.update({
    where: { id },
    data: { isActive: false },
  });
};
