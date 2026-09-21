import { NavLink } from "react-router-dom";

import type { AdminNavItem } from "./nav";
import styles from "./AdminLayout.module.css";

type Props = {
  item: AdminNavItem;
  onNavigate?: () => void;
};

export const AdminNavItemLink = ({ item, onNavigate }: Props) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
      onClick={onNavigate}
    >
      <Icon size={18} aria-hidden="true" />
      {item.label}
    </NavLink>
  );
};
