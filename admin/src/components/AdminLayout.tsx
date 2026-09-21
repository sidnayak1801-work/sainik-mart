import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/context";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import styles from "./AdminLayout.module.css";

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className={styles.layout}>
      {menuOpen ? (
        <button type="button" className={styles.overlay} aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      ) : null}
      <AdminSidebar open={menuOpen} onLogout={handleLogout} onNavigate={() => setMenuOpen(false)} />
      <AdminHeader
        user={user}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onLogout={handleLogout}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};
