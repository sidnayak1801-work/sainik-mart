import { LogOut } from "lucide-react";

import { ADMIN_NAV } from "./nav";
import { AdminNavItemLink } from "./AdminNavItem";
import styles from "./AdminLayout.module.css";

type Props = {
  open: boolean;
  onLogout: () => void;
  onNavigate: () => void;
};

export const AdminSidebar = ({ open, onLogout, onNavigate }: Props) => {
  return (
    <aside id="admin-sidebar" className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarBrand}>
        <img src="/logo.png" alt="" width={32} height={32} />
        <span>Sainik Mart</span>
      </div>
      <nav className={styles.nav} aria-label="Admin">
        {ADMIN_NAV.map((item) => (
          <AdminNavItemLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className={styles.sidebarLogout}>
        <button type="button" onClick={onLogout}>
          <LogOut size={18} aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
};
