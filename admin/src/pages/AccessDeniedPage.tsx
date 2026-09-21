import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/context";
import styles from "@/components/pages.module.css";

export const AccessDeniedPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const backToLogin = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className={styles.denied}>
      <div className={styles.deniedCard}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access the admin dashboard.</p>
        <button type="button" onClick={backToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
};
