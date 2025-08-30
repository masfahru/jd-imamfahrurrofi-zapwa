import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "./product-dialog";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Interface for items in the shopping cart
interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  priceAmount1000: number;
}

// Props for the dialog component
interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: {
    items: { productId: string; quantity: number }[];
    customer: { name: string; phone: string };
  }) => void;
  isSaving: boolean;
}

// Helper function to format currency to IDR
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export function CreateOrderDialog({ open, onOpenChange, onSave, isSaving }: CreateOrderDialogProps) {
  // State for cart items
  const [cart, setCart] = useState<CartItem[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  // Form for customer details
  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name is required' : null),
      phone: (value) => (value.trim().length < 10 ? 'A valid phone number is required' : null),
    },
  });

  // This prevents sending a request to the server on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["userProductsForOrder", debouncedSearchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20", // Fetch a limited number for performance
        search: debouncedSearchQuery,
      });
      const res = await fetch(`${SERVER_URL}/api/user/products?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products.");
      const paginatedData = await res.json();
      return paginatedData.data.items;
    },
    enabled: open, // Only fetch when the dialog is open
  });

  const handleAddProductToCart = () => {
    if (!selectedProductId) return;
    const productToAdd = productsData?.find(p => p.id === selectedProductId);

    // Prevent adding duplicates
    if (!productToAdd || cart.some(item => item.productId === selectedProductId)) {
      return;
    };

    // Add to cart and reset inputs
    setCart([...cart, { productId: productToAdd.id, name: productToAdd.name, quantity: 1, priceAmount1000: productToAdd.priceAmount1000 }]);
    setSelectedProductId(null);
    setSearchQuery("");
  };

  // Handlers for cart item quantity and removal
  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart(cart.map(item => item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Calculate total order price
  const total = cart.reduce((sum, item) => sum + (item.priceAmount1000 / 1000) * item.quantity, 0);

  // Handle form submission
  const handleSubmit = () => {
    const validation = form.validate();
    if (validation.hasErrors || cart.length === 0) return;

    onSave({
      items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
      customer: form.values,
    });
  };

  // Reset all state when the dialog is closed
  useEffect(() => {
    if (!open) {
      setCart([]);
      setSelectedProductId(null);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setPopoverOpen(false);
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Find the full product object for the selected ID to display its name
  const selectedProduct = productsData?.find(p => p.id === selectedProductId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Add customer details and products to create a new order.</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 py-4">
          {/* Customer Form */}
          <div className="grid gap-4 pt-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Customer Name</Label>
              <Input id="name" {...form.getInputProps('name')} placeholder="John Doe"/>
              {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Customer Phone</Label>
              <Input id="phone" {...form.getInputProps('phone')} placeholder="081234567890"/>
              {form.errors.phone && <p className="text-sm text-red-500">{form.errors.phone}</p>}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            <div className="flex items-center">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-[350px] justify-between rounded-r-none overflow-hidden"
                  >
                    {selectedProduct ?
                      selectedProduct.name : "Select a product..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search product by name..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingProducts ? "Loading..." : "No product found."}
                      </CommandEmpty>
                      {!isLoadingProducts && (
                        <CommandGroup>
                          {productsData?.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              disabled={cart.some(item => item.productId === product.id)}
                              onSelect={() => {
                                setSelectedProductId(product.id);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {product.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button onClick={handleAddProductToCart} disabled={!selectedProductId} className="rounded-l-none">
                Add
              </Button>
            </div>

            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length > 0 ? cart.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency((item.priceAmount1000 / 1000) * item.quantity)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No products added yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <div className="text-lg font-bold">Total: {formatCurrency(total)}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving || cart.length === 0}>
            {isSaving ? "Creating..." : "Create Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
