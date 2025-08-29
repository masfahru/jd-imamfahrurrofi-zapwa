import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { AdminManagementPage } from "./pages/admin/AdminManagementPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Changed path from "/login" to "/admin/login" */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="admins" element={<AdminManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
