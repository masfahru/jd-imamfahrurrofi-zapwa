import { createRoute, z } from "@hono/zod-openapi";
import {
  requireAuth,
  requireRole,
} from "@server/core/middleware/auth.middleware";
import {
  UserSchema,
  AddAdminBodySchema,
  UpdateAdminParamsSchema,
  UpdateAdminBodySchema,
  DeleteAdminParamsSchema,
  UpdateUserRoleParamsSchema,
  UpdateUserRoleBodySchema,
  UpdateUserRoleResponseSchema,
} from "./admin.schema";
import { createPaginatedResponseSchema, createSuccessResponseSchema, ErrorSchema } from '@server/core/utils/response';

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
      content: { "application/json": { schema: createSuccessResponseSchema(UserSchema) } }, // [!code focus]
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
          schema: createPaginatedResponseSchema(UserSchema), // [!code focus]
        },
      },
      description: "A paginated list of admin and super admin users", // [!code focus]
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
// NEW: Definition for updating an admin
export const updateAdminRoute = createRoute({
  method: 'put',
  path: '/admins/{id}',
  middleware: [requireAuth, requireRole(['super admin'])],
  security: [{ BearerAuth: [] }],
  summary: "Update an admin's name or email",
  tags: ['Admin'],
  request: {
    params: UpdateAdminParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateAdminBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: createSuccessResponseSchema(UserSchema) } }, // [!code focus]
      description: 'Admin updated successfully',
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Bad Request (e.g., validation error)',
    },
    401: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Unauthorized',
    },
    403: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Forbidden',
    },
    404: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Admin not found',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error',
    },
  },
});
// NEW: Definition for deleting an admin
export const deleteAdminRoute = createRoute({
  method: 'delete',
  path: '/admins/{id}',
  middleware: [requireAuth, requireRole(['super admin'])],
  security: [{ BearerAuth: [] }],
  summary: 'Delete an admin user',
  tags: ['Admin'],
  request: {
    params: DeleteAdminParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createSuccessResponseSchema(z.object({ id: z.string() })), // [!code focus]
        },
      },
      description: 'Admin deleted successfully',
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Bad Request (e.g., trying to delete super admin)',
    },
    401: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Unauthorized',
    },
    403: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Forbidden',
    },
    404: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Admin not found',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error',
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
          schema: createPaginatedResponseSchema(UserSchema), // [!code focus]
        },
      },
      description: "A paginated list of all users in the system", // [!code focus]
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
          schema: UpdateUserRoleResponseSchema, // This already uses createSuccessResponseSchema
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
