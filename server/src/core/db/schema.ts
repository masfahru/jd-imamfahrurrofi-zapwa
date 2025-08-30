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
  licenseId: text("licenseId")
    .notNull()
    .references(() => licenses.id, { onDelete: "cascade" }),
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

export type Product = typeof products.$inferSelect;

// Customers Table
export const customers = pgTable("customer", {
  id: text("id").primaryKey(),
  licenseId: text("licenseId")
    .notNull()
    .references(() => licenses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// Orders Table
export const orders = pgTable("order", {
  id: text("id").primaryKey(),
  licenseId: text("licenseId")
    .notNull()
    .references(() => licenses.id, { onDelete: "cascade" }),
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

export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  licenseId: text("licenseId")
    .notNull()
    .references(() => licenses.id, { onDelete: "cascade" }),
  customerIdentifier: text("customerIdentifier").notNull(), // e.g., customer phone number
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// New Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("sessionId")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "tool"] }).notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("toolCalls"),
  toolCallId: text("tool_call_id"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: text("id").primaryKey(),
  licenseId: text("licenseId")
    .notNull()
    .references(() => licenses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  behavior: text("behavior").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// RELATIONS
export const usersRelations = relations(users, ({ one }) => ({
  license: one(licenses, { fields: [users.id], references: [licenses.userId] }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  license: one(licenses, { fields: [customers.licenseId], references: [licenses.id] }),
  orders: many(orders),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
  customers: many(customers),
  chatSessions: many(chatSessions),
  aiAgents: many(aiAgents),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  license: one(licenses, { fields: [products.licenseId], references: [licenses.id] }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  license: one(licenses, { fields: [orders.licenseId], references: [licenses.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  license: one(licenses, { fields: [chatSessions.licenseId], references: [licenses.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, { fields: [chatMessages.sessionId], references: [chatSessions.id] }),
}));

export const aiAgentsRelations = relations(aiAgents, ({ one }) => ({
  license: one(licenses, { fields: [aiAgents.licenseId], references: [licenses.id] }),
}));
