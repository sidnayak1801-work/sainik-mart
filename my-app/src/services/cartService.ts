import * as apiCart from "@/api/cart";
import { ApiError } from "@/api/client";
import { getProduct } from "@/api/products";
import { clearGuestLines, getGuestLines, setGuestLines, type GuestCartLine } from "@/storage/guestCart";
import { getToken } from "@/storage/authStorage";
import type { Cart, CartLineItem, Product } from "@/types/models";

const signedIn = async (): Promise<boolean> => Boolean(await getToken());

const unitPrice = (product: Product): number => {
  return product.discountPrice ?? product.price;
};

const toLine = (product: Product, quantity: number): CartLineItem => {
  const price = unitPrice(product);
  return {
    id: product.id,
    quantity,
    lineTotal: price * quantity,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice ?? null,
      imageUrl: product.imageUrl ?? null,
      stockQuantity: product.stockQuantity ?? 0,
    },
  };
};

const guestCart = async (): Promise<Cart> => {
  const stored = await getGuestLines();
  const kept: GuestCartLine[] = [];
  const items: CartLineItem[] = [];

  for (const line of stored) {
    try {
      const product = await getProduct(line.productId);
      const stock = product.stockQuantity ?? 0;
      const quantity = Math.min(line.quantity, stock);
      if (quantity <= 0) continue;
      kept.push({ productId: product.id, quantity });
      items.push(toLine(product, quantity));
    } catch {
      // Drop products that are no longer available.
    }
  }

  if (kept.length !== stored.length) {
    await setGuestLines(kept);
  }

  return {
    id: "guest",
    items,
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
};

export const getCart = async (): Promise<Cart> => {
  if (await signedIn()) return apiCart.getCart();
  return guestCart();
};

export const addCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  if (await signedIn()) return apiCart.addCartItem(productId, quantity);

  const product = await getProduct(productId);
  const stock = product.stockQuantity ?? 0;
  const lines = await getGuestLines();
  const existing = lines.find((line) => line.productId === productId);
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty <= 0) {
    throw new ApiError("Invalid quantity", 400);
  }
  if (nextQty > stock) {
    throw new ApiError("Insufficient stock", 400);
  }
  if (existing) {
    existing.quantity = nextQty;
  } else {
    lines.push({ productId, quantity: nextQty });
  }
  await setGuestLines(lines);
  return guestCart();
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  if (await signedIn()) return apiCart.updateCartItem(itemId, quantity);
  if (quantity <= 0) return deleteCartItem(itemId);

  const product = await getProduct(itemId);
  const stock = product.stockQuantity ?? 0;
  if (quantity > stock) {
    throw new ApiError("Insufficient stock", 400);
  }
  const lines = await getGuestLines();
  const existing = lines.find((line) => line.productId === itemId);
  if (!existing) {
    throw new ApiError("Cart item not found", 404);
  }
  existing.quantity = quantity;
  await setGuestLines(lines);
  return guestCart();
};

export const deleteCartItem = async (itemId: string): Promise<Cart> => {
  if (await signedIn()) return apiCart.deleteCartItem(itemId);
  await setGuestLines((await getGuestLines()).filter((line) => line.productId !== itemId));
  return guestCart();
};

export const lineForProduct = (cart: Cart | null, productId: string): CartLineItem | undefined => {
  return cart?.items.find((item) => item.product.id === productId);
};

export const setProductQuantity = async (
  productId: string,
  quantity: number,
  cart: Cart | null,
): Promise<Cart> => {
  const line = lineForProduct(cart, productId);
  if (quantity <= 0) {
    if (!line) {
      return cart ?? { id: "guest", items: [], subtotal: 0 };
    }
    return deleteCartItem(line.id);
  }
  if (!line) {
    return addCartItem(productId, quantity);
  }
  return updateCartItem(line.id, quantity);
};

export const mergeGuestCart = async (): Promise<Cart> => {
  const lines = await getGuestLines();
  if (lines.length === 0) {
    return apiCart.getCart();
  }

  for (const line of lines) {
    try {
      await apiCart.addCartItem(line.productId, line.quantity);
    } catch {
      // Skip lines the server rejects (stock / unavailable).
    }
  }

  await clearGuestLines();
  return apiCart.getCart();
};
