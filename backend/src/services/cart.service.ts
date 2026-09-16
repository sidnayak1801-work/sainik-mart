import { notImplemented } from "../utils/notImplemented";

export const getCart = async (_userId: string) => {
  return notImplemented("Get cart");
};

export const addCartItem = async (_userId: string, _input: unknown) => {
  return notImplemented("Add cart item");
};

export const updateCartItem = async (_userId: string, _itemId: string, _input: unknown) => {
  return notImplemented("Update cart item");
};

export const deleteCartItem = async (_userId: string, _itemId: string) => {
  return notImplemented("Delete cart item");
};
