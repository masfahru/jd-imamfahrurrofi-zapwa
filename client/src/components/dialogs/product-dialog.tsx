import { useEffect } from "react";
import { useForm } from "@mantine/form";
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
import { Textarea } from "@/components/ui/textarea"; // Import the new Textarea component

// Define the shape of a Product based on our schema
export interface Product {
  id: string;
  name: string;
  retailerId?: string | null;
  priceAmount1000: number;
  description?: string | null;
  imageCdnUrls?: string[] | null; // Add image URLs
}

// Define the shape of the form values
interface ProductFormValues {
  name: string;
  retailerId: string;
  price: number;
  description: string;
  imageUrl: string; // A single field for the image URL for simplicity
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (values: Omit<Product, "id">) => void;
  isSaving: boolean;
}

export function ProductDialog({ open, onOpenChange, product, onSave, isSaving }: ProductDialogProps) {
  const form = useForm<ProductFormValues>({
    initialValues: {
      name: "",
      retailerId: "",
      price: 0,
      description: "",
      imageUrl: "",
    },
    validate: {
      name: (value) => (value.length < 3 ? "Name is too short" : null),
      price: (value) => (value <= 0 ? "Price must be a positive number" : null),
      description: (value) => (value.length < 10 ? "Description must be at least 10 characters" : null),
      imageUrl: (value) => {
        try {
          if (value.trim() === "") return null;
          new URL(value);
          return null;
        } catch (_) {
          return "Please enter a valid URL";
        }
      },
    },
  });

  // When the dialog opens for editing, populate the form
  useEffect(() => {
    if (product) {
      form.setValues({
        name: product.name,
        retailerId: product.retailerId || "",
        price: product.priceAmount1000 / 1000,
        description: product.description || "",
        imageUrl: product.imageCdnUrls?.[0] || "", // Use the first image URL
      });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, open]);

  const handleSubmit = (values: ProductFormValues) => {
    onSave({
      name: values.name,
      retailerId: values.retailerId,
      priceAmount1000: values.price * 1000,
      description: values.description,
      imageCdnUrls: [values.imageUrl],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              Provide the details for your product. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...form.getInputProps("name")} />
              {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="price">Price (IDR)</Label>
                <Input id="price" type="number" {...form.getInputProps("price")} />
                {form.errors.price && <p className="text-sm text-red-500">{form.errors.price}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="retailerId">SKU (Optional)</Label>
                <Input id="retailerId" {...form.getInputProps("retailerId")} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="imageUrl">Product Image URL</Label>
              <Input id="imageUrl" placeholder="https://example.com/image.png" {...form.getInputProps("imageUrl")} />
              {form.errors.imageUrl && <p className="text-sm text-red-500">{form.errors.imageUrl}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe your product in detail..."
                {...form.getInputProps("description")}
                className="h-32 resize-none"
              />
              {form.errors.description && <p className="text-sm text-red-500">{form.errors.description}</p>}
            </div>
            {form.errors.root && <p className="text-sm font-medium text-destructive text-center">{form.errors.root}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
