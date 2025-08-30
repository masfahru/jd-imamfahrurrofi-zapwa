import { OpenAPIHono } from "@hono/zod-openapi";
import type { User } from "@server/core/middleware/auth.middleware";
import { jsonResponse } from "@server/core/utils/response";
import {
  createProductRoute,
  deleteProductRoute,
  getProductsRoute,
  updateProductRoute,
} from "./product.openapi";
import {
  createProduct,
  deleteProduct,
  getProductsByUserId,
  updateProduct,
} from "./product.service";

type UserEnv = { Variables: { user: User } };
const app = new OpenAPIHono<UserEnv>();

app.openapi(createProductRoute, async (c) => {
  const currentUser = c.get("user");
  const productData = c.req.valid("json");

  const newProduct = await createProduct(currentUser.id, productData);
  return jsonResponse(c, "Product created successfully", newProduct, 201);
});

app.openapi(getProductsRoute, async (c) => {
  const currentUser = c.get("user");
  const { page, limit, search } = c.req.valid("query");

  const products = await getProductsByUserId(
    currentUser.id,
    parseInt(page),
    parseInt(limit),
    search,
  );
  return jsonResponse(c, "Products retrieved successfully", products);
});

app.openapi(updateProductRoute, async (c) => {
  const currentUser = c.get("user");
  const { id } = c.req.valid("param");
  const productData = c.req.valid("json");

  const updatedProduct = await updateProduct(currentUser.id, id, productData);
  return jsonResponse(c, "Product updated successfully", updatedProduct);
});

app.openapi(deleteProductRoute, async (c) => {
  const currentUser = c.get("user");
  const { id } = c.req.valid("param");

  const deleted = await deleteProduct(currentUser.id, id);
  return jsonResponse(c, "Product deleted successfully", deleted);
});

export default app;
