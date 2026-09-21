import { DashboardQuickLink } from "@/components/DashboardQuickLink";
import styles from "@/components/pages.module.css";

export const DashboardPage = () => {
  return (
    <div>
      <section className={styles.welcome}>
        <h1>Welcome to Sainik Mart Admin</h1>
        <p>Use the navigation to open each workspace. Management tools will appear here as they are built.</p>
      </section>
      <h2 className={styles.sectionTitle}>Quick Access</h2>
      <div className={styles.grid}>
        <DashboardQuickLink to="/admin/products" title="Products" description="Manage grocery products" />
        <DashboardQuickLink to="/admin/categories" title="Categories" description="Manage product categories" />
        <DashboardQuickLink to="/admin/orders" title="Orders" description="View customer orders" />
        <DashboardQuickLink to="/admin/inventory" title="Inventory" description="Monitor stock" />
      </div>
    </div>
  );
};
