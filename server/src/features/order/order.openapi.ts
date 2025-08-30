import { createRoute, z } from "@hono/zod-openapi";
import { requireAuth, requireLicense } from "@server/core/middleware/auth.middleware";
import { createSuccessResponseSchema, ErrorSchema } from "@server/core/utils/response";
import {
  CreateOrderBodySchema,
  GetOrdersQuerySchema,
  OrderIdParamsSchema,
  PaginatedOrdersResponseSchema,
  SingleOrderResponseSchema,
  UpdateOrderBodySchema
} from "./order.schema";

const userOnly = [requireAuth, requireLicense];

export const createOrderRoute = createRoute({
  method: "post",
  path: "/",
  middleware: userOnly,
  summary: "Create a new order",
  tags: ["Orders"],
  request: {
    body: { content: { "application/json": { schema: CreateOrderBodySchema } } },
  },
  responses: {
    201: {
      description: "Order created successfully",
      content: { "application/json": { schema: SingleOrderResponseSchema } }
    },
    400: { description: "Bad Request", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const getOrdersRoute = createRoute({
  method: "get",
  path: "/",
  middleware: userOnly,
  summary: "Get a list of orders for the current user",
  tags: ["Orders"],
  request: {
    query: GetOrdersQuerySchema,
  },
  responses: {
    200: {
      description: "A paginated list of the user's orders",
      content: { "application/json": { schema: PaginatedOrdersResponseSchema } },
    },
  },
});

export const getOrderByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  middleware: userOnly,
  summary: "Get a single order by its ID",
  tags: ["Orders"],
  request: {
    params: OrderIdParamsSchema,
  },
  responses: {
    200: {
      description: "The details of the order",
      content: { "application/json": { schema: SingleOrderResponseSchema } },
    },
    404: {
      description: "Order not found or does not belong to the user",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

export const updateOrderRoute = createRoute({
  method: "put",
  path: "/{id}",
  middleware: userOnly,
  summary: "Update an order's status",
  tags: ["Orders"],
  request: {
    params: OrderIdParamsSchema,
    body: { content: { "application/json": { schema: UpdateOrderBodySchema } } },
  },
  responses: {
    200: {
      description: "Order updated successfully",
      content: { "application/json": { schema: SingleOrderResponseSchema } }
    },
    404: { description: "Order not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const deleteOrderRoute = createRoute({
  method: "delete",
  path: "/{id}",
  middleware: userOnly,
  summary: "Delete an order",
  tags: ["Orders"],
  request: {
    params: OrderIdParamsSchema,
  },
  responses: {
    200: {
      description: "Order deleted successfully",
      content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string() })) } }
    },
    404: { description: "Order not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});
