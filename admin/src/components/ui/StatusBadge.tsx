import styles from "./DataTable.module.css";

type Props = {
  kind: "active" | "inactive" | "in" | "low" | "out";
  children: string;
};

const classForKind: Record<Props["kind"], string> = {
  active: styles.active,
  inactive: styles.inactive,
  in: styles.inStock,
  low: styles.lowStock,
  out: styles.outStock,
};

export const StatusBadge = ({ kind, children }: Props) => {
  return <span className={`${styles.badge} ${classForKind[kind]}`}>{children}</span>;
};
