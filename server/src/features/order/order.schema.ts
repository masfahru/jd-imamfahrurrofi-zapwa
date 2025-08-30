import { z } from "@hono/zod-openapi";
import { createPaginatedResponseSchema, createSuccessResponseSchema } from "@server/core/utils/response";
import { ORDER_STATUSES } from "@server/core/db/schema";

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
}).openapi("Customer");

// Schema for a single item within an order
export const OrderItemSchema = z.object({
  id: z.string(),
  productName: z.string(),
  priceAmount1000: z.number().int(),
  quantity: z.number().int(),
  customer: CustomerSchema,
}).openapi("OrderItem");

// Schema for a full order, including its items
export const OrderSchema = z.object({
  id: z.string(),
  totalAmount1000: z.number().int(),
  status: z.enum(ORDER_STATUSES),
  createdAt: z.iso.datetime(),
  items: z.array(z.any()),
  customer: CustomerSchema,
}).openapi("Order");

// Schemas for request bodies
const CreateOrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive("Quantity must be positive"),
});

export const CreateOrderBodySchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1, "Order must have at least one item"),
  customer: z.object({
    name: z.string().min(2, "Customer name is required"),
    phone: z.string().min(10, "A valid phone number is required"),
  }),
});

export const UpdateOrderBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

// Schema for URL parameters
export const OrderIdParamsSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: 'order-123',
  }),
});

// Schema for query parameters when fetching a list of orders
export const GetOrdersQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  status: z.enum([...ORDER_STATUSES, "all"]).optional().default("all"),
});

// Response Schemas
export const SingleOrderResponseSchema = createSuccessResponseSchema(OrderSchema);
export const PaginatedOrdersResponseSchema = createPaginatedResponseSchema(OrderSchema);
