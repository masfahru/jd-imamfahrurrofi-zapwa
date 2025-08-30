import { OpenAPIHono } from "@hono/zod-openapi";
import type { User } from "@server/core/middleware/auth.middleware";
import { jsonResponse } from "@server/core/utils/response";
import {
  createOrderRoute,
  deleteOrderRoute,
  getOrderByIdRoute,
  getOrdersRoute,
  updateOrderRoute
} from "./order.openapi";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus
} from "./order.service";

type UserEnv = { Variables: { user: User } };
const app = new OpenAPIHono<UserEnv>();

app.openapi(createOrderRoute, async (c) => {
  const currentUser = c.get("user");
  const orderData = c.req.valid("json");
  const newOrder = await createOrder(currentUser.id, orderData);
  return jsonResponse(c, "Order created successfully", newOrder, 201);
});

app.openapi(getOrdersRoute, async (c) => {
  const currentUser = c.get("user");
  const { page, limit, search } = c.req.valid("query");

  const result = await getOrdersByUserId(
    currentUser.id,
    parseInt(page),
    parseInt(limit),
    search,
  );
  return jsonResponse(c, "Orders retrieved successfully", result);
});

app.openapi(getOrderByIdRoute, async (c) => {
  const currentUser = c.get("user");
  const { id } = c.req.valid("param");

  const order = await getOrderById(currentUser.id, id);
  return jsonResponse(c, "Order details retrieved successfully", order);
});

app.openapi(updateOrderRoute, async (c) => {
  const currentUser = c.get("user");
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  const updatedOrder = await updateOrderStatus(currentUser.id, id, data);
  return jsonResponse(c, "Order updated successfully", updatedOrder);
});

app.openapi(deleteOrderRoute, async (c) => {
  const currentUser = c.get("user");
  const { id } = c.req.valid("param");
  const result = await deleteOrder(currentUser.id, id);
  return jsonResponse(c, "Order deleted successfully", result);
});

export default app;
