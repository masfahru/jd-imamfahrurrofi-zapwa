import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Order, ViewOrderDialog } from "@/components/dialogs/view-order-dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreateOrderDialog } from "@/components/dialogs/create-order-dialog";
import { EditOrderDialog } from "@/components/dialogs/edit-order-dialog";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface PaginatedResponse<T> {
  message: string;
  data: {
    items: T[];
    pagination: { totalItems: number; totalPages: number; currentPage: number; };
  };
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const { data: orderData, isLoading, isError, error } = useQuery<PaginatedResponse<Order>, Error>({
    queryKey: ["orders", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      const res = await fetch(`${SERVER_URL}/api/user/orders?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders.");
      return res.json();
    },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedOrder(null);
  }

  const { mutate: createOrder, isPending: isCreating } = useMutation({
    mutationFn: (newOrder: { items: { productId: string; quantity: number }[] }) =>
      fetch(`${SERVER_URL}/api/user/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('Failed to create order'); return res.json(); }),
    onSuccess: handleSuccess,
  });

  const { mutate: updateOrder, isPending: isUpdating } = useMutation({
    mutationFn: (data: { status: string }) =>
      fetch(`${SERVER_URL}/api/user/orders/${selectedOrder?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      }).then(res => { if (!res.ok) throw new Error('Failed to update order'); return res.json(); }),
    onSuccess: handleSuccess,
  });

  const { mutate: deleteOrder } = useMutation({
    mutationFn: (orderId: string) =>
      fetch(`${SERVER_URL}/api/user/orders/${orderId}`, { method: 'DELETE', credentials: 'include' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const columns: ColumnDef<Order>[] = [
    { accessorKey: "id", header: "Order ID", cell: ({ row }) => `#${row.original.id.slice(0, 8).toUpperCase()}` },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{row.original.status}</Badge> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    { accessorKey: "totalAmount1000", header: () => <div className="text-right">Total</div>, cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.totalAmount1000 / 1000)}</div> },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="icon" onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => { setSelectedOrder(order); setEditDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete order #{order.id.slice(0,8).toUpperCase()}.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteOrder(order.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (isError) return <div>Error fetching orders: {error.message}</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
        <Button onClick={() => setCreateDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4"/> Create Order</Button>
      </div>

      <DataTableToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Filter orders by ID..." />
      {isLoading ? (<div>Loading orders...</div>) : (<DataTable columns={columns} data={orderData?.data?.items ?? []} />)}
      {orderData?.data?.pagination && (
        <DataTablePagination
          currentPage={orderData.data.pagination.currentPage}
          totalPages={orderData.data.pagination.totalPages}
          totalCount={orderData.data.pagination.totalItems}
          itemPerPage={limit}
          onPageChange={setPage}
          onPerPageChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        />
      )}

      <ViewOrderDialog open={isViewDialogOpen} onOpenChange={setViewDialogOpen} order={selectedOrder} />
      <CreateOrderDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} onSave={createOrder} isSaving={isCreating} />
      <EditOrderDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen} order={selectedOrder} onSave={updateOrder} isSaving={isUpdating} />
    </main>
  );
}
