import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLES } from "server/src/core/db/schema";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  name: string;
  role: (typeof ROLES)[number] | null;
  banned: boolean;
}

interface PaginatedUsersResponse {
  data: {
    items: User[];
    // We can add pagination controls later using this info
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
    }
  }
}

function UserList() {
  const {
    data,
    isLoading,
    error,
    isError,
  } = useQuery<PaginatedUsersResponse, Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch users.");
      }
      return res.json();
    },
  });

  const users = data?.data?.items || [];

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>A list of all users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="py-3">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">
                Role: {user.role}
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
