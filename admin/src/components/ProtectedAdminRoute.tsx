import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/auth/context";
import { AccessDeniedPage } from "@/pages/AccessDeniedPage";

const SessionLoading = () => (
  <div className="session-status" role="status">
    Checking admin session...
  </div>
);

const SessionError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="session-status" role="alert">
    <h1>Unable to verify session</h1>
    <p>{message}</p>
    <button type="button" onClick={onRetry}>
      Try again
    </button>
  </div>
);

export const ProtectedAdminRoute = () => {
  const { isLoading, isAuthenticated, isAdmin, sessionError, retrySession } = useAuth();

  if (isLoading) {
    return <SessionLoading />;
  }

  if (sessionError && !isAuthenticated) {
    return <SessionError message={sessionError} onRetry={() => void retrySession()} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
};
