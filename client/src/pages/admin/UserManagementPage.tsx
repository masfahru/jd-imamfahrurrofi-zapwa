import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user";
  license?: { key: string } | null;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export function UserManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const { data, isLoading, isError, error } = useQuery<{ data: { items: User[], pagination: Pagination } }, Error>({
    queryKey: ["users", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      const res = await fetch(`${SERVER_URL}/api/admin/users?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users.");
      return res.json();
    },
  });
  const { mutate: assignLicense, isPending: isAssigning } = useMutation({
    mutationFn: (userId: string) => fetch(`${SERVER_URL}/api/admin/users/${userId}/license`, { method: "POST", credentials: "include" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
  const { mutate: removeLicense, isPending: isRemoving } = useMutation({
    mutationFn: (userId: string) => fetch(`${SERVER_URL}/api/admin/users/${userId}/license`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
  const users = data?.data?.items || [];
  const pagination = data?.data?.pagination;
  const columns: ColumnDef<User>[] = [
    { id: "index", header: "No.", cell: ({ row }) => (page - 1) * limit + row.index + 1 },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "license.key",
      header: "License Key",
      cell: ({ row }) => row.original.license?.key || <span className="text-muted-foreground">N/A</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const hasLicense = !!user.license?.key;
        return (
          <div className="flex justify-end space-x-2">
            {hasLicense ? (
              <Button variant="destructive" size="sm" onClick={() => removeLicense(user.id)} disabled={isRemoving}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove License
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={() => assignLicense(user.id)} disabled={isAssigning}>
                <PlusCircle className="mr-2 h-4 w-4" /> Assign License
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error fetching users: {error.message}</div>;
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">User Management</h1>
      </div>
      <DataTableToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Filter users by name or email..." />
      <DataTable columns={columns} data={users} />
      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalItems}
          itemPerPage={limit}
          onPageChange={setPage}
          onPerPageChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        />
      )}
    </main>
  );
}
