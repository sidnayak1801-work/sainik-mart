import { LOW_STOCK_THRESHOLD } from "@/constants/inventory";

export const formatMoney = (value: number): string => `₹${value.toFixed(2)}`;

export const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const stockStatusLabel = (quantity: number): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "In Stock";
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKING: "Packing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const formatOrderStatus = (status: string): string => ORDER_STATUS_LABELS[status] ?? status;

export const shortId = (id: string): string => id.slice(0, 8);
