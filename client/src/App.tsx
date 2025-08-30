import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { AdminManagementPage } from "./pages/admin/AdminManagementPage";

import { UserLoginPage } from "./pages/user/UserLoginPage";
import { UserSignupPage } from "./pages/user/UserSignupPage";
import { UserProtectedRoute } from "./components/UserProtectedRoute";
import { UserLayout } from "./components/layout/UserLayout";
import { UserDashboardPage } from "./pages/user/DashboardPage";
import { PendingLicensePage } from "./pages/user/PendingLicensePage";
import { ProductsPage } from "./pages/user/ProductsPage";
import { OrdersPage } from "./pages/user/OrdersPage";
import { AIAgentsPage } from "./pages/user/AIAgentsPage";
import { ChatPage } from "./pages/user/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/user/login" replace />} />

        <Route path="/admin/login" element={<Login />} />

        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/user/signup" element={<UserSignupPage />} />
        <Route path="/pending-license" element={<PendingLicensePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="admins" element={<AdminManagementPage />} />
          </Route>
        </Route>

        <Route element={<UserProtectedRoute />}>
          <Route path="/dashboard" element={<UserLayout />}>
            <Route index element={<UserDashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="ai-agents" element={<AIAgentsPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
