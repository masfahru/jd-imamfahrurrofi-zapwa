import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super admin";
  banned: boolean;
}

// Form component for adding a new admin
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

  const { mutate: addAdmin, isPending } = useMutation({
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
      setOpen(false); // Close the dialog on success
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
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" {...form.getInputProps("name")} className="col-span-3" />
          {form.errors.name && <p className="col-span-4 text-sm text-red-500 text-center">{form.errors.name}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" type="email" {...form.getInputProps("email")} className="col-span-3" />
          {form.errors.email && <p className="col-span-4 text-sm text-red-500 text-center">{form.errors.email}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">Password</Label>
          <Input id="password" type="password" {...form.getInputProps("password")} className="col-span-3" />
          {form.errors.password && <p className="col-span-4 text-sm text-red-500 text-center">{form.errors.password}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select onValueChange={(value) => form.setFieldValue("role", value as "admin" | "super admin")} defaultValue={form.values.role}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
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

function AdminList() {
  const { data: admins, isLoading, error, isError } = useQuery<AdminUser[], Error>({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/admin/admins`, {
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

export function AdminManagementPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Admin Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <AddAdminForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>
      <AdminList />
    </div>
  );
}
