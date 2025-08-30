import { z } from "@hono/zod-openapi";
import {
  createPaginatedResponseSchema,
  createSuccessResponseSchema,
} from "@server/core/utils/response";

// Base schema representing a product, used for API responses
export const ProductSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  isHidden: z.boolean(),
  url: z.url().nullable(),
  description: z.string().nullable(),
  availability: z.string(),
  currency: z.string(),
  priceAmount1000: z.number().int(),
  salePriceAmount1000: z.number().int().nullable(),
  retailerId: z.string().nullable(),
  imageCdnUrls: z.array(z.url()).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
}).openapi("Product");

// Schema for the body when CREATING a new product
export const CreateProductBodySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  isHidden: z.boolean().default(false),
  url: z.url("Must be a valid URL").optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  currency: z.string().length(3, "Must be a 3-letter currency code").default("IDR"),
  priceAmount1000: z
    .number({ message: "Price is required" })
    .int()
    .positive("Price must be positive"),
  retailerId: z.string().optional(),
  imageCdnUrls: z.array(z.union([z.url().trim().optional(), z.literal("")])).optional().default([]),
});

// Schema for the body when UPDATING an existing product
// All fields are optional
export const UpdateProductBodySchema = CreateProductBodySchema.partial();

// Schema for query parameters when fetching a list of products
export const GetProductsQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
});

// Schema for response when fetching a single product
export const SingleProductResponseSchema = createSuccessResponseSchema(ProductSchema);

// Schema for response when fetching a list of products
export const PaginatedProductsResponseSchema = createPaginatedResponseSchema(ProductSchema);
