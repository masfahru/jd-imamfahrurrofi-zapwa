import { createRoute, z } from "@hono/zod-openapi";
import {requireAuth, requireLicense, requireRole} from "@server/core/middleware/auth.middleware";
import {createSuccessResponseSchema, ErrorSchema} from "@server/core/utils/response";
import {
  CreateProductBodySchema,
  GetProductsQuerySchema,
  PaginatedProductsResponseSchema,
  ProductSchema,
  SingleProductResponseSchema,
  UpdateProductBodySchema,
} from "./product.schema";

const userOnly = [requireAuth, requireLicense];

export const createProductRoute = createRoute({
  method: "post",
  path: "/",
  middleware: userOnly,
  summary: "Create a new product for the current user",
  tags: ["Products"],
  request: {
    body: { content: { "application/json": { schema: CreateProductBodySchema } } },
  },
  responses: {
    201: { description: "Product created successfully", content: { "application/json": { schema: SingleProductResponseSchema } } },
    400: { description: "Bad Request", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const getProductsRoute = createRoute({
  method: "get",
  path: "/",
  middleware: userOnly,
  summary: "Get a list of products for the current user",
  tags: ["Products"],
  request: {
    query: GetProductsQuerySchema,
  },
  responses: {
    200: { description: "List of products", content: { "application/json": { schema: PaginatedProductsResponseSchema } } },
  },
});

export const updateProductRoute = createRoute({
  method: "put",
  path: "/{id}",
  middleware: userOnly,
  summary: "Update a product by its ID",
  tags: ["Products"],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: UpdateProductBodySchema } } },
  },
  responses: {
    200: { description: "Product updated successfully", content: { "application/json": { schema: SingleProductResponseSchema } } },
    404: { description: "Product not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const deleteProductRoute = createRoute({
  method: "delete",
  path: "/{id}",
  middleware: userOnly,
  summary: "Delete a product by its ID",
  tags: ["Products"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { description: "Product deleted successfully", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string() })) } } },
    404: { description: "Product not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});
