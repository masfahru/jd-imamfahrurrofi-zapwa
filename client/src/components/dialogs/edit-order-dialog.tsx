import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Order } from "./view-order-dialog";

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSave: (values: { status: typeof ORDER_STATUSES[number] }) => void;
  isSaving: boolean;
}

export function EditOrderDialog({ open, onOpenChange, order, onSave, isSaving }: EditOrderDialogProps) {
  const form = useForm({
    initialValues: {
      status: 'pending' as typeof ORDER_STATUSES[number],
    },
  });

  useEffect(() => {
    if (order) {
      form.setValues({ status: order.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, open]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.onSubmit(onSave)}>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Update the status for order #{order.id.slice(0, 8).toUpperCase()}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-1.5">
              <Label htmlFor="status">Order Status</Label>
              <Select onValueChange={(value) => form.setFieldValue('status', value as typeof ORDER_STATUSES[number])} value={form.values.status}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
