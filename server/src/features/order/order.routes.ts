import { OpenAPIHono } from "@hono/zod-openapi";
import { type UserEnv, requireAuth, requireLicense } from "@server/core/middleware/auth.middleware";
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
  getOrdersByLicenseId, // Renamed
  updateOrderStatus
} from "./order.service";

const app = new OpenAPIHono<UserEnv>();

app.openapi(createOrderRoute, async (c) => {
  const license = c.get("license");
  const orderData = c.req.valid("json");
  const newOrder = await createOrder(license.id, orderData);
  return jsonResponse(c, "Order created successfully", newOrder, 201);
});

app.openapi(getOrdersRoute, async (c) => {
  const license = c.get("license");
  const { page, limit, search } = c.req.valid("query");

  const result = await getOrdersByLicenseId( // Renamed
    license.id,
    parseInt(page),
    parseInt(limit),
    search,
  );
  return jsonResponse(c, "Orders retrieved successfully", result);
});

app.openapi(getOrderByIdRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");

  const order = await getOrderById(license.id, id);
  return jsonResponse(c, "Order details retrieved successfully", order);
});

app.openapi(updateOrderRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");
  const updatedOrder = await updateOrderStatus(license.id, id, data);
  return jsonResponse(c, "Order updated successfully", updatedOrder);
});

app.openapi(deleteOrderRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");
  const result = await deleteOrder(license.id, id);
  return jsonResponse(c, "Order deleted successfully", result);
});

export default app;
