import { z } from "@hono/zod-openapi";
import { ROLES } from "@server/core/db/schema";

export const ErrorSchema = z
  .object({
    error: z.string().openapi({
      example: "Unauthorized",
    }),
  })
  .openapi("Error");

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "1" }),
    email: z.email().openapi({ example: "admin@example.com" }),
    name: z.string().openapi({ example: "Admin User" }),
    role: z.enum(ROLES).nullable().openapi({ example: "admin" }),
    banned: z.boolean().nullable().openapi({ example: false }),
  })
  .openapi("User");

// New Schema for adding an admin
export const AddAdminBodySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "super admin"]),
});

export const UpdateUserRoleParamsSchema = z.object({
  id: z.string().min(1).openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: "user-123",
  }),
});

export const UpdateUserRoleBodySchema = z.object({
  role: z.enum(ROLES),
});

export const UpdateUserRoleResponseSchema = z.object({
  message: z.string().openapi({ example: "User role updated successfully" }),
  user: z.object({
    id: z.string().openapi({ example: "user-123" }),
    email: z.email().openapi({ example: "user@example.com" }),
    role: z.enum(ROLES).nullable().openapi({ example: "admin" }),
  }),
});
