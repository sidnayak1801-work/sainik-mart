import { AdminPageHeader } from "@/components/AdminPageHeader";
import styles from "@/components/pages.module.css";

export const ProductsPage = () => {
  return (
    <div>
      <AdminPageHeader title="Products" description="Catalog products for the customer app." />
      <div className={styles.shell}>Product management will be available here.</div>
    </div>
  );
};
