import { AdminPageHeader } from "@/components/AdminPageHeader";
import styles from "@/components/pages.module.css";

export const InventoryPage = () => {
  return (
    <div>
      <AdminPageHeader title="Inventory" description="Watch stock levels across the catalog." />
      <div className={styles.shell}>Inventory management will be available here.</div>
    </div>
  );
};
