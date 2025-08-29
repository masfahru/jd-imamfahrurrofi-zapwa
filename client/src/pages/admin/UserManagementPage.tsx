import { useQuery } from "@tanstack/react-query";
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

function UserList() {
  const {
    data: admins,
    isLoading,
    error,
    isError,
  } = useQuery<AdminUser[], Error>({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/users`, {
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
              <p className="text-sm text-gray-500 capitalize">
                Role: {admin.role}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function UserManagementPage() {
  return (
    <div>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">User Management</h1>
      </div>
      <UserList />
    </div>
  );
}
