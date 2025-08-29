import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/lib/authStore";

export function UserProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore.getState(); // Use getState to get latest state

  const isAuth = isAuthenticated && user && user.role === 'user';

  if (!isAuth) {
    return <Navigate to="/user/login" replace />;
  }

  if (!user.licenseKey) {
    return <Navigate to="/pending-license" replace />;
  }

  return <Outlet />;
}
