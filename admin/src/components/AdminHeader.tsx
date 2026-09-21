import { Menu, X } from "lucide-react";

import type { User } from "@/types/auth";

import styles from "./AdminLayout.module.css";

type Props = {
  user: User;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onLogout: () => void;
};

export const AdminHeader = ({ user, menuOpen, onToggleMenu, onLogout }: Props) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          onClick={onToggleMenu}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>
        <img src="/logo.png" alt="" width={36} height={36} />
        <h1>Sainik Mart Admin</h1>
      </div>
      <div className={styles.userBlock}>
        <div className={styles.userMeta}>
          <strong>{user.name || "Admin"}</strong>
          <span>{user.email}</span>
        </div>
        <button type="button" className={styles.logoutButton} onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};
