import { db } from "@server/core/db/drizzle";
import { products } from "@server/core/db/schema";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { auth } from "@server/features/auth/auth.config";
import { randomUUIDv7 } from "bun";
import type { CreateProductBodySchema } from "./product.schema";
import type { z } from "zod";

type ProductData = z.infer<typeof CreateProductBodySchema>;

/**
 * Creates a new product for a specific license.
 * @param licenseId - The ID of the license creating the product.
 * @param data - The product data.
 * @returns The newly created product object.
 */
export const createProduct = async (licenseId: string, data: ProductData) => {
  const authContext = await auth.$context;
  const generateId = authContext.generateId;

  if (typeof generateId !== "function") {
    throw new HTTPException(500, { message: "Auth context is not properly configured." });
  }

  const newProductId = generateId({ model: "product" }) || randomUUIDv7();
  const cleanedData = {
    ...data,
    imageCdnUrls: data.imageCdnUrls?.filter((url): url is string => !!url),
  };

  const [newProduct] = await db
    .insert(products)
    .values({
      id: newProductId,
      licenseId: licenseId, // Use licenseId
      ...cleanedData,
    })
    .returning();

  if (!newProduct) {
    throw new HTTPException(500, { message: "Failed to create the new product." });
  }

  return newProduct;
};

/**
 * Fetches a paginated list of products for a specific license.
 * @param licenseId - The ID of the license whose products to fetch.
 * @param page - The page number.
 * @param limit - The number of items per page.
 * @param search - Optional search term for product name or retailerId.
 * @returns A paginated list of products.
 */
export const getProductsByLicenseId = async (
  licenseId: string,
  page: number,
  limit: number,
  search?: string,
) => {
  const offset = (page - 1) * limit;
  const whereClause = and(
    eq(products.licenseId, licenseId), // Use licenseId
    search
      ? or(
        ilike(products.name, `%${search}%`),
        ilike(products.retailerId, `%${search}%`),
      )
      : undefined,
  );

  const totalItemsResult = await db.select({ value: count() }).from(products).where(whereClause);
  const totalItems = totalItemsResult[0]?.value || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const userProducts = await db.query.products.findMany({
    where: whereClause,
    offset,
    limit,
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  return {
    items: userProducts,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Updates a product, ensuring the license owns it.
 * @param licenseId - The ID of the license performing the update.
 * @param productId - The ID of the product to update.
 * @param data - The new data for the product.
 * @returns The updated product object.
 */
export const updateProduct = async (
  licenseId: string,
  productId: string,
  data: Partial<ProductData>,
) => {
  const cleanedData = {
    ...data,
    imageCdnUrls: data.imageCdnUrls?.filter((url): url is string => !!url),
  };

  const [updatedProduct] = await db
    .update(products)
    .set({ ...cleanedData, updatedAt: new Date() })
    .where(and(eq(products.id, productId), eq(products.licenseId, licenseId))) // Use licenseId
    .returning();

  if (!updatedProduct) {
    throw new HTTPException(404, { message: "Product not found or you don't have permission to edit it." });
  }
  return updatedProduct;
};

/**
 * Deletes a product, ensuring the license owns it.
 * @param licenseId - The ID of the license performing the deletion.
 * @param productId - The ID of the product to delete.
 * @returns An object with the ID of the deleted product.
 */
export const deleteProduct = async (licenseId: string, productId: string) => {
  const [deletedProduct] = await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.licenseId, licenseId))) // Use licenseId
    .returning({ id: products.id });

  if (!deletedProduct) {
    throw new HTTPException(404, { message: "Product not found or you don't have permission to delete it." });
  }

  return deletedProduct;
};
