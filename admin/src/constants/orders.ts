import type { OrderStatus } from "@/types/models";

export const ORDER_PAGE_SIZE = 10;

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export const nextOrderStatuses = (current: OrderStatus): OrderStatus[] => {
  switch (current) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["PACKING"];
    case "PACKING":
      return ["OUT_FOR_DELIVERY"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED"];
    default:
      return [];
  }
};
