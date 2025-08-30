import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Define the shape of OrderItem to match the backend
interface OrderItem {
  id: string;
  productName: string;
  priceAmount1000: number;
  quantity: number;
}

// Define Customer interface
interface Customer {
  id: string;
  name: string;
  phone?: string | null;
}

export interface Order {
  id: string;
  totalAmount1000: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  customer: Customer;
}

interface ViewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

// A simple function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ViewOrderDialog({ open, onOpenChange, order }: ViewOrderDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Viewing details for order #{order.id.slice(0, 8).toUpperCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Customer Info</h3>
              <p className="text-sm"><strong>Name:</strong> {order.customer.name}</p>
              {order.customer.phone && <p className="text-sm"><strong>Phone:</strong> {order.customer.phone}</p>}
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Order Info</h3>
              <p className="text-sm"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm"><strong>Status:</strong> <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{order.status}</Badge></p>
            </div>
          </div>

          <h3 className="font-semibold mt-4">Items</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Product</TableHead>
                  <TableHead className="w-[15%] text-right">Quantity</TableHead>
                  <TableHead className="w-[20%] text-right">Unit Price</TableHead>
                  <TableHead className="w-[15%] text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-normal break-words">
                      {item.productName}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.priceAmount1000 / 1000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency((item.priceAmount1000 / 1000) * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
            <div className="w-full max-w-xs text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{formatCurrency(order.totalAmount1000 / 1000)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
