import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/lib/authStore";

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  const isAuthorized =
    isAuthenticated && user && (user.role === "admin" || user.role === "super admin");

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
