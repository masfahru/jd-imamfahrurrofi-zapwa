import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { type Product, ProductDialog } from "@/components/dialogs/product-dialog";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface PaginatedResponse<T> {
  message: string;
  data: {
    items: T[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  const { data: productData, isLoading, isError, error } = useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ["products", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      const res = await fetch(`${SERVER_URL}/api/user/products?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products.");
      return res.json();
    },
  });

  const products = productData?.data?.items ?? [];
  const pagination = productData?.data?.pagination;

  const handleMutationSuccess = (message: string) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleMutationError = (error: Error) => {
    toast.error(error.message || "An unexpected error occurred.");
  };

  const { mutate: createProduct, isPending: isCreating } = useMutation({
    mutationFn: (newProduct: Omit<Product, 'id'>) =>
      fetch(`${SERVER_URL}/api/user/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create product.");
        return res.json();
      }),
    onSuccess: () => handleMutationSuccess("Product created successfully!"),
    onError: handleMutationError,
  });

  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: (productToUpdate: Product) =>
      fetch(`${SERVER_URL}/api/user/products/${productToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToUpdate),
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update product.");
        return res.json();
      }),
    onSuccess: () => handleMutationSuccess("Product updated successfully!"),
    onError: handleMutationError,
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (productId: string) =>
      fetch(`${SERVER_URL}/api/user/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error("Failed to delete product.");
      }),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: handleMutationError,
  });

  const handleSave = (values: Omit<Product, 'id'>) => {
    if (selectedProduct) {
      updateProduct({ ...values, id: selectedProduct.id });
    } else {
      createProduct(values);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: "index",
      header: "No.",
      cell: ({ row }) => {
        const startIndex = (page - 1) * limit;
        return startIndex + row.index + 1;
      },
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "retailerId", header: "SKU" },
    {
      accessorKey: "priceAmount1000",
      header: "Price",
      cell: ({ row }) => `IDR ${(row.original.priceAmount1000 / 1000).toLocaleString('id-ID')}`,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="icon" onClick={() => {
              setSelectedProduct(product);
              setDialogOpen(true);
            }}>
              <Edit className="h-4 w-4"/>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{product.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteProduct(product.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (isError) return <div>Error fetching products: {error.message}</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Products</h1>
        <Button onClick={() => {
          setSelectedProduct(null);
          setDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4"/> Add Product
        </Button>
      </div>

      <DataTableToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Filter product by title.."/>
      {isLoading ? (
        <div>Loading products...</div>
      ) : (
        <DataTable columns={columns} data={products}/>
      )}
      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalItems}
          itemPerPage={limit}
          onPageChange={setPage}
          onPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </main>
  );
}
