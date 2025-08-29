import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, KeyRound, PlusCircle, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { EditAdminDialog } from "@/components/dialogs/edit-admin-dialog";
import { ChangePasswordDialog } from "@/components/dialogs/change-password-dialog";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { InputPassword } from "@/components/ui/input-password.tsx";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super admin";
  banned: boolean;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Dialog Form for adding a new admin
function AddAdminForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "admin" as "admin" | "super admin",
    },
    validate: {
      name: (value) => (value.length < 2 ? "Name is too short" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8 ? "Password must be at least 8 characters" : null,
    },
  });

  const { mutate: addAdmin, isPending } = useMutation<Admin, Error, typeof form.values>({
    mutationFn: async (values: typeof form.values) => {
      const res = await fetch(`${SERVER_URL}/api/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add admin");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setOpen(false);
      form.reset();
    },
    onError: (err) => {
      form.setErrors({ root: err.message });
    },
  });
  return (
    <form onSubmit={form.onSubmit((values) => addAdmin(values))}>
      <DialogHeader>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogDescription>
          Fill in the details to create a new admin or super admin user.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Form Fields */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" {...form.getInputProps("name")} className="col-span-3"/>
          {form.errors.name && <p className="col-span-4 text-sm text-red-500 text-center">{form.errors.name}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" type="email" {...form.getInputProps("email")} className="col-span-3"/>
          {form.errors.email && <p className="col-span-4 text-sm text-red-500 text-center">{form.errors.email}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">Password</Label>
          <InputPassword
            id="password"
            {...form.getInputProps("password")}
            className="col-span-3"
          />
          {form.errors.password &&
            <p className="col-span-4 text-sm text-red-500 text-center">{form.errors.password}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select onValueChange={(value) => form.setFieldValue("role", value as "admin" | "super admin")}
                  defaultValue={form.values.role}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.errors.root && <p className="text-sm font-medium text-destructive text-center">{form.errors.root}</p>}
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add Admin"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main Page Component
export function AdminManagementPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | undefined>();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onPerPageChange = (newPerPage: number) => {
    setLimit(newPerPage);
    setPage(1); // Reset to the first page when page size changes
  };

  // Fetch admins using useQuery
  const { data: adminData, isLoading, isError, error } = useQuery<{ data: { items: Admin[], pagination: Pagination } }, Error>({
    queryKey: ["admins", page, limit],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/admins?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch admins.");
      }
      return res.json();
    },
  });
  const admins = adminData?.data?.items || [];
  const pagination = adminData?.data?.pagination;

  // Mutation for deleting an admin
  const { mutate: deleteAdmin } = useMutation({
    mutationFn: async (adminId: string) => {
      const res = await fetch(`${SERVER_URL}/api/admin/admins/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete admin");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
  // Mutation for updating an admin
  const { mutate: updateAdmin } = useMutation<Admin, Error, Omit<Admin, 'role' | 'banned'>>({
    mutationFn: async (admin: Omit<Admin, 'role' | 'banned'>) => {
      const res = await fetch(`${SERVER_URL}/api/admin/admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: admin.name, email: admin.email }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update admin");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsEditDialogOpen(false);
    },
  });

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation<{ success: boolean }, Error, { adminId: string, password: string }>({
    mutationFn: async ({ adminId, password }: { adminId: string, password: string }) => {
      const res = await fetch(`${SERVER_URL}/api/admin/admins/${adminId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      return res.json();
    },
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsEditDialogOpen(true);
  };
  const handleSave = (updatedAdmin: Admin) => {
    updateAdmin(updatedAdmin);
  };
  const handleOpenPasswordDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsPasswordDialogOpen(true);
  };
  const handleSavePassword = (adminId: string, password: string) => {
    changePassword({ adminId, password });
  };

  const columns: ColumnDef<Admin>[] = [
    {
      id: "index",
      header: "No.",
      cell: ({ row }) => {
        const startIndex = (page - 1) * limit;
        return startIndex + row.index + 1;
      },
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <span className="capitalize">{row.original.role}</span>
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpenPasswordDialog(admin)}
              disabled={admin.role === 'super admin' && admin.id !== currentUser?.id}
            >
              <KeyRound className="h-4 w-4"/>
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleEdit(admin)}>
              <Edit className="h-4 w-4"/>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={admin.id === '1'}>
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the admin account for {admin.name}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteAdmin(admin.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div>Loading admins...</div>;
  if (isError) return <div>Error fetching admins: {error.message}</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Admin Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4"/> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <AddAdminForm setOpen={setAddDialogOpen}/>
          </DialogContent>
        </Dialog>
      </div>
      <DataTableToolbar/>
      <DataTable columns={columns} data={admins}/>
      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalItems}
          itemPerPage={limit}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
      <EditAdminDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        admin={selectedAdmin}
        onSave={handleSave}
      />
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        admin={selectedAdmin}
        onSave={handleSavePassword}
        isSaving={isChangingPassword}
      />
    </main>
  );
}
