import { AdminPageHeader } from "@/components/AdminPageHeader";
import styles from "@/components/pages.module.css";

export const OrdersPage = () => {
  return (
    <div>
      <AdminPageHeader title="Orders" description="Review and fulfill customer orders." />
      <div className={styles.shell}>Order management will be available here.</div>
    </div>
  );
};
