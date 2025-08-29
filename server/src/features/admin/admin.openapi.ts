import { createRoute, z } from "@hono/zod-openapi";
import {
  requireAuth,
  requireRole,
} from "@server/core/middleware/auth.middleware";
import {
  ErrorSchema,
  UserSchema,
  UpdateUserRoleParamsSchema,
  UpdateUserRoleBodySchema,
  UpdateUserRoleResponseSchema,
  AddAdminBodySchema, // Import new schema
} from "./admin.schema";

// New Route Definition for adding an admin
export const addAdminRoute = createRoute({
  method: "post",
  path: "/admins",
  middleware: [requireAuth, requireRole(["super admin"])],
  security: [{ BearerAuth: [] }],
  summary: "Create a new admin user",
  tags: ["Admin"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddAdminBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: UserSchema } },
      description: "Admin user created successfully",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Bad Request (e.g., email already exists)",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Forbidden",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Internal Server Error",
    },
  },
});

export const getAdminsRoute = createRoute({
  method: "get",
  path: "/admins",
  middleware: [requireAuth, requireRole(["super admin"])],
  security: [{ BearerAuth: [] }],
  summary: "List all admin and super admin users",
  tags: ["Admin"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(UserSchema),
        },
      },
      description: "A list of admin and super admin users",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Forbidden",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Internal Server Error",
    },
  },
});

export const getUsersRoute = createRoute({
  method: "get",
  path: "/users",
  middleware: [requireAuth, requireRole(["admin", "super admin"])],
  security: [{ BearerAuth: [] }],
  summary: "List all users",
  tags: ["Admin"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(UserSchema),
        },
      },
      description: "A list of all users in the system",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Forbidden",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Internal Server Error",
    },
  },
});

export const setUserRoleRoute = createRoute({
  method: "post",
  path: "/users/{id}/role",
  middleware: [requireAuth, requireRole(["super admin"])],
  security: [{ BearerAuth: [] }],
  summary: "Set a user's role (super admin only)",
  tags: ["Admin"],
  request: {
    params: UpdateUserRoleParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateUserRoleBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UpdateUserRoleResponseSchema,
        },
      },
      description: "User role updated successfully",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description:
        "Bad Request (e.g., user not found, demoting primary super admin)",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Forbidden",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Internal Server Error",
    },
  },
});
