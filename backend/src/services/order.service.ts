import { notImplemented } from "../utils/notImplemented";

export const createOrder = async (_userId: string, _input: unknown) => {
  return notImplemented("Create order");
};

export const listOrders = async (_userId: string) => {
  return notImplemented("List orders");
};

export const getOrderById = async (_userId: string, _id: string) => {
  return notImplemented("Get order");
};

export const cancelOrder = async (_userId: string, _id: string) => {
  return notImplemented("Cancel order");
};

export const updateOrderStatus = async (_id: string, _status: unknown) => {
  return notImplemented("Update order status");
};
