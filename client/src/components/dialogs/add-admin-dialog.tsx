import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { InputPassword } from "@/components/ui/input-password.tsx";
import { Admin } from "@/pages/admin/AdminManagementPage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAdminDialog({ open, onOpenChange }: AddAdminDialogProps) {
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
      onOpenChange(false);
    },
    onError: (err) => {
      form.setErrors({ root: err.message });
    },
  });

  // Reset form state when the dialog is closed
  useEffect(() => {
    if (!open) {
      // Delay resetting to allow closing animation to finish
      const timer = setTimeout(() => form.reset(), 300);
      return () => clearTimeout(timer);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
