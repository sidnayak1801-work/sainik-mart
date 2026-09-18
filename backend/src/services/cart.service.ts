import { Prisma } from "@prisma/client";

import type { AddCartItemInput, UpdateCartItemInput } from "../validators/cart.validators";
import { AppError } from "../utils/AppError";
import { prisma } from "../utils/prisma";

const toMoney = (value: Prisma.Decimal | null): number | null => {
  if (value === null) {
    return null;
  }
  return Number(value);
};

const cartItemInclude = {
  product: {
    include: {
      category: {
        select: { isActive: true },
      },
    },
  },
} as const;

const cartInclude = {
  items: {
    include: cartItemInclude,
    orderBy: { createdAt: "asc" as const },
  },
};

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

const effectivePrice = (product: {
  price: Prisma.Decimal;
  discountPrice: Prisma.Decimal | null;
}): number => {
  const discounted = toMoney(product.discountPrice);
  if (discounted !== null) {
    return discounted;
  }
  return toMoney(product.price) ?? 0;
};

const serializeCart = (cart: CartWithItems) => {
  const items = cart.items.map((item) => {
    const unitPrice = effectivePrice(item.product);
    return {
      id: item.id,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: toMoney(item.product.price) ?? 0,
        discountPrice: toMoney(item.product.discountPrice),
        imageUrl: item.product.imageUrl,
        stockQuantity: item.product.stockQuantity,
      },
    };
  });

  return {
    id: cart.id,
    items,
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
};

const getOrCreateCart = (tx: Prisma.TransactionClient, userId: string) => {
  return tx.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  });
};

const loadProduct = async (tx: Prisma.TransactionClient, productId: string) => {
  const product = await tx.product.findUnique({
    where: { id: productId },
    include: { category: { select: { isActive: true } } },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const assertPurchasable = (product: { isActive: boolean; category: { isActive: boolean } }) => {
  if (!product.isActive || !product.category.isActive) {
    throw new AppError("Product is not available", 400);
  }
};

const assertStock = (requested: number, stock: number) => {
  if (requested > stock) {
    throw new AppError("Insufficient stock", 400);
  }
};

const requireOwnedItem = async (tx: Prisma.TransactionClient, userId: string, itemId: string) => {
  const item = await tx.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: cartItemInclude,
  });

  if (!item) {
    throw new AppError("Cart item not found", 404);
  }

  return item;
};

const reloadCart = (tx: Prisma.TransactionClient, cartId: string) => {
  return tx.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: cartInclude,
  });
};

export const getCart = async (userId: string) => {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  });

  return serializeCart(cart);
};

export const addCartItem = async (userId: string, input: AddCartItemInput) => {
  const cart = await prisma.$transaction(async (tx) => {
    const product = await loadProduct(tx, input.productId);
    assertPurchasable(product);

    const cartRow = await getOrCreateCart(tx, userId);
    const existing = cartRow.items.find((item) => item.productId === input.productId);
    const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
    assertStock(nextQuantity, product.stockQuantity);

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
    } else {
      try {
        await tx.cartItem.create({
          data: {
            cartId: cartRow.id,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const raced = await tx.cartItem.findUnique({
            where: {
              cartId_productId: { cartId: cartRow.id, productId: input.productId },
            },
          });

          if (!raced) {
            throw error;
          }

          const racedQuantity = raced.quantity + input.quantity;
          assertStock(racedQuantity, product.stockQuantity);
          await tx.cartItem.update({
            where: { id: raced.id },
            data: { quantity: racedQuantity },
          });
        } else {
          throw error;
        }
      }
    }

    return reloadCart(tx, cartRow.id);
  });

  return serializeCart(cart);
};

export const updateCartItem = async (userId: string, itemId: string, input: UpdateCartItemInput) => {
  const cart = await prisma.$transaction(async (tx) => {
    const item = await requireOwnedItem(tx, userId, itemId);
    assertPurchasable(item.product);
    assertStock(input.quantity, item.product.stockQuantity);

    await tx.cartItem.update({
      where: { id: item.id },
      data: { quantity: input.quantity },
    });

    return reloadCart(tx, item.cartId);
  });

  return serializeCart(cart);
};

export const deleteCartItem = async (userId: string, itemId: string) => {
  const cart = await prisma.$transaction(async (tx) => {
    const item = await requireOwnedItem(tx, userId, itemId);
    await tx.cartItem.delete({ where: { id: item.id } });
    return reloadCart(tx, item.cartId);
  });

  return serializeCart(cart);
};
