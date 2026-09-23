import styles from "./DataTable.module.css";

type Props = {
  kind:
    | "active"
    | "inactive"
    | "in"
    | "low"
    | "out"
    | "pending"
    | "confirmed"
    | "packing"
    | "outForDelivery"
    | "delivered"
    | "cancelled";
  children: string;
};

const classForKind: Record<Props["kind"], string> = {
  active: styles.active,
  inactive: styles.inactive,
  in: styles.inStock,
  low: styles.lowStock,
  out: styles.outStock,
  pending: styles.pending,
  confirmed: styles.confirmed,
  packing: styles.packing,
  outForDelivery: styles.outForDelivery,
  delivered: styles.delivered,
  cancelled: styles.cancelled,
};

export const StatusBadge = ({ kind, children }: Props) => {
  return <span className={`${styles.badge} ${classForKind[kind]}`}>{children}</span>;
};
