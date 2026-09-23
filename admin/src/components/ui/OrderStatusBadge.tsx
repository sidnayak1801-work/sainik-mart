import type { OrderStatus } from "@/types/models";
import { formatOrderStatus } from "@/utils/format";

import { StatusBadge } from "./StatusBadge";

const kindForStatus: Record<OrderStatus, "pending" | "confirmed" | "packing" | "outForDelivery" | "delivered" | "cancelled"> =
  {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PACKING: "packing",
    OUT_FOR_DELIVERY: "outForDelivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  return <StatusBadge kind={kindForStatus[status]}>{formatOrderStatus(status)}</StatusBadge>;
};
