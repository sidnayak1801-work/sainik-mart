import { AdminPageHeader } from "@/components/AdminPageHeader";
import styles from "@/components/pages.module.css";

export const CategoriesPage = () => {
  return (
    <div>
      <AdminPageHeader title="Categories" description="Organize products into grocery categories." />
      <div className={styles.shell}>Category management will be available here.</div>
    </div>
  );
};
