import { OpenAPIHono } from "@hono/zod-openapi";
import { type UserEnv, requireAuth, requireLicense } from "@server/core/middleware/auth.middleware";
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
  getProductsByLicenseId, // Renamed
  updateProduct,
} from "./product.service";

const app = new OpenAPIHono<UserEnv>();

app.openapi(createProductRoute, async (c) => {
  const license = c.get("license");
  const productData = c.req.valid("json");

  const newProduct = await createProduct(license.id, productData);
  return jsonResponse(c, "Product created successfully", newProduct, 201);
});

app.openapi(getProductsRoute, async (c) => {
  const license = c.get("license");
  const { page, limit, search } = c.req.valid("query");

  const products = await getProductsByLicenseId( // Renamed
    license.id,
    parseInt(page),
    parseInt(limit),
    search,
  );
  return jsonResponse(c, "Products retrieved successfully", products);
});

app.openapi(updateProductRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");
  const productData = c.req.valid("json");

  const updatedProduct = await updateProduct(license.id, id, productData);
  return jsonResponse(c, "Product updated successfully", updatedProduct);
});

app.openapi(deleteProductRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");

  const deleted = await deleteProduct(license.id, id);
  return jsonResponse(c, "Product deleted successfully", deleted);
});

export default app;
