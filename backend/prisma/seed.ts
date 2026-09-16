import { prisma } from "../src/utils/prisma";

const categories = [
  { name: "Dairy", imageUrl: null as string | null },
  { name: "Fruits & Vegetables", imageUrl: null },
  { name: "Bakery", imageUrl: null },
];

const products: Array<{
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  categoryName: string;
}> = [
  {
    name: "Toned Milk 1L",
    description: "Fresh toned milk, chilled.",
    price: 62,
    discountPrice: 58,
    stockQuantity: 40,
    categoryName: "Dairy",
  },
  {
    name: "Curd 400g",
    description: "Thick set curd.",
    price: 45,
    stockQuantity: 24,
    categoryName: "Dairy",
  },
  {
    name: "Bananas 6 pcs",
    description: "Ripe bananas for daily use.",
    price: 50,
    discountPrice: 42,
    stockQuantity: 30,
    categoryName: "Fruits & Vegetables",
  },
  {
    name: "Tomatoes 500g",
    description: "Farm-fresh tomatoes.",
    price: 28,
    stockQuantity: 50,
    categoryName: "Fruits & Vegetables",
  },
  {
    name: "Whole Wheat Bread",
    description: "Soft whole wheat loaf.",
    price: 40,
    stockQuantity: 18,
    categoryName: "Bakery",
  },
];

const seed = async () => {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { name: category.name },
      create: { name: category.name, imageUrl: category.imageUrl, isActive: true },
      update: { isActive: true, imageUrl: category.imageUrl },
    });
    categoryIds.set(category.name, row.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.categoryName);
    if (!categoryId) continue;

    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      stockQuantity: product.stockQuantity,
      categoryId,
      isActive: true,
    };

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({ data });
    }
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
