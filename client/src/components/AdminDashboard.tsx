import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super admin";
  banned: boolean;
}

function AdminList() {
  // We no longer need the token from the store
  const { data: admins, isLoading, error, isError } = useQuery<AdminUser[], Error>({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/users`, {
        // IMPORTANT: Send the cookie with this request
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch admins.");
      }
      return res.json();
    },
  });

  if (isLoading) return <div>Loading admins...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Management</CardTitle>
        <CardDescription>
          List of all 'admin' and 'super admin' users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {admins?.map((admin) => (
            <li key={admin.id} className="py-3">
              <p className="font-semibold">{admin.name}</p>
              <p className="text-sm text-gray-500">{admin.email}</p>
              <p className="text-sm text-gray-500 capitalize">Role: {admin.role}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout(); // This now calls the server
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name || "Admin"}!</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      {user?.role === "super admin" && <AdminList />}
    </div>
  );
}
