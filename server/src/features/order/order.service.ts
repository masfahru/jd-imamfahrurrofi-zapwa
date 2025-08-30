import { db } from "@server/core/db/drizzle";
import { orders, orderItems, products, customers } from "@server/core/db/schema";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { auth } from "@server/features/auth/auth.config";
import { randomUUIDv7 } from "bun";
import type { z } from "zod";
import type { CreateOrderBodySchema, UpdateOrderBodySchema } from "./order.schema";

type CreateOrderData = z.infer<typeof CreateOrderBodySchema>;
type UpdateOrderData = z.infer<typeof UpdateOrderBodySchema>;

export const createOrder = async (licenseId: string, data: CreateOrderData) => {
  if (data.items.length === 0) {
    throw new HTTPException(400, { message: "Order must contain at least one item." });
  }

  const productIds = data.items.map(item => item.productId);
  const dbProducts = await db.query.products.findMany({
    where: and(
      inArray(products.id, productIds),
      eq(products.licenseId, licenseId) // Ensure license owns the products
    ),
  });

  if (dbProducts.length !== productIds.length) {
    throw new HTTPException(400, { message: "One or more products are invalid or do not belong to you." });
  }

  let customer = await db.query.customers.findFirst({
    where: and(eq(customers.phone, data.customer.phone), eq(customers.licenseId, licenseId)),
  });

  const authContext = await auth.$context;
  const generateId = authContext.generateId;
  if (typeof generateId !== "function") {
    throw new HTTPException(500, { message: "Auth context is not properly configured." });
  }

  if (!customer) {
    const newCustomerId = generateId({ model: "customer" }) || randomUUIDv7();
    [customer] = await db.insert(customers).values({
      id: newCustomerId,
      licenseId: licenseId,
      name: data.customer.name,
      phone: data.customer.phone,
    }).returning();
  } else {
    [customer] = await db.update(customers).set({
      name: data.customer.name,
      updatedAt: new Date()
    }).where(eq(customers.id, customer.id)).returning();
  }

  if (!customer) {
    throw new HTTPException(500, { message: "Failed to create or find customer." });
  }

  const productPriceMap = new Map(dbProducts.map(p => [p.id, p]));

  let totalAmount1000 = 0;
  const itemsToInsert = data.items.map(item => {
    const product = productPriceMap.get(item.productId);
    if (!product) {
      throw new HTTPException(404, { message: `Product with id ${item.productId} not found.` });
    }
    totalAmount1000 += product.priceAmount1000 * item.quantity;
    return {
      productId: product.id,
      productName: product.name,
      priceAmount1000: product.priceAmount1000,
      quantity: item.quantity,
    };
  });

  const newOrderId = generateId({ model: "order" }) || randomUUIDv7();
  const [newOrder] = await db.transaction(async (tx) => {
    const insertedOrder = await tx
      .insert(orders)
      .values({
        id: newOrderId,
        licenseId: licenseId, // Use licenseId
        customerId: customer!.id,
        totalAmount1000,
        status: 'pending',
      })
      .returning();

    const orderItemsWithIds = itemsToInsert.map(item => ({
      id: generateId({ model: "order_item" }) || randomUUIDv7(),
      orderId: newOrderId,
      ...item,
    }));

    await tx.insert(orderItems).values(orderItemsWithIds);

    return insertedOrder;
  });

  if (!newOrder) {
    throw new HTTPException(500, { message: "Failed to create order." });
  }

  return getOrderById(licenseId, newOrder.id);
};

export const updateOrderStatus = async (licenseId: string, orderId: string, data: UpdateOrderData) => {
  const [updatedOrder] = await db
    .update(orders)
    .set({ status: data.status, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.licenseId, licenseId)))
    .returning();

  if (!updatedOrder) {
    throw new HTTPException(404, { message: "Order not found or you don't have permission to edit it." });
  }

  return getOrderById(licenseId, updatedOrder.id);
};

export const deleteOrder = async (licenseId: string, orderId: string) => {
  const [deletedOrder] = await db
    .delete(orders)
    .where(and(eq(orders.id, orderId), eq(orders.licenseId, licenseId)))
    .returning({ id: orders.id });

  if (!deletedOrder) {
    throw new HTTPException(404, { message: "Order not found or you don't have permission to delete it." });
  }
  return deletedOrder;
};

export const getOrdersByLicenseId = async (
  licenseId: string,
  page: number,
  limit: number,
  search?: string,
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "all",
) => {
  const offset = (page - 1) * limit;

  const whereClause = and(
    eq(orders.licenseId, licenseId),
    search ? or(ilike(orders.id, `%${search}%`), ilike(customers.name, `%${search}%`)) : undefined,
    status && status !== 'all' ? eq(orders.status, status) : undefined,
  );

  const totalItemsResult = await db
    .select({ value: count() })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id)) // Join for searching
    .where(whereClause);

  const totalItems = totalItemsResult[0]?.value || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const userOrders = await db.query.orders.findMany({
    where: whereClause,
    with: {
      items: {
        columns: { id: true, productName: true, priceAmount1000: true, quantity: true },
      },
      customer: true,
    },
    offset,
    limit,
    orderBy: [desc(orders.createdAt)],
  });

  return {
    items: userOrders,
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

export const getOrderById = async (licenseId: string, orderId: string) => {
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.licenseId, licenseId)),
    with: {
      items: true,
      customer: true,
    },
  });

  if (!order) {
    throw new HTTPException(404, { message: "Order not found or you don't have permission to view it." });
  }

  return order;
};
