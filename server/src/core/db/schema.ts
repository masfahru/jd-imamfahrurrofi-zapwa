import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const ROLES = ["user", "admin", "super admin"] as const;
export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

// Core 'user' table required by better-auth
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  image: text("image"),
  role: text("role", { enum: ROLES }).default("user"),
  banned: boolean("banned").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// Core 'account' table
export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    withTimezone: true,
  }),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// Core 'session' table
export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export const licenses = pgTable("license", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }).unique(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export const products = pgTable("product", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  url: text("url"),
  description: text("description"),
  availability: text("availability").default("in stock").notNull(),
  currency: text("currency").default("IDR").notNull(),
  priceAmount1000: integer("priceAmount1000").notNull(),
  salePriceAmount1000: integer("salePriceAmount1000"),
  retailerId: text("retailerId"),
  imageCdnUrls: jsonb("imageCdnUrls").$type<string[]>(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// Customers Table
export const customers = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// Orders Table
export const orders = pgTable("order", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  customerId: text("customerId")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  totalAmount1000: integer("totalAmount1000").notNull(),
  status: text("status", { enum: ORDER_STATUSES }).default("pending").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// Order Items Table
export const orderItems = pgTable("order_item", {
  id: text("id").primaryKey(),
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("productId")
    .references(() => products.id, { onDelete: "set null" }),
  productName: text("productName").notNull(),
  priceAmount1000: integer("priceAmount1000").notNull(),
  quantity: integer("quantity").notNull(),
});

// RELATIONS
export const usersRelations = relations(users, ({ one, many }) => ({
  license: one(licenses, { fields: [users.id], references: [licenses.userId] }),
  products: many(products),
  orders: many(orders),
  customers: many(customers),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  orders: many(orders),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, { fields: [products.userId], references: [users.id] }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }), // ADD THIS LINE
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
