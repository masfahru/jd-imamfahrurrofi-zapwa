import { z } from "@hono/zod-openapi";
import { ROLES } from "@server/core/db/schema";
import { createSuccessResponseSchema } from "@server/core/utils/response";

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "1" }),
    email: z.email().openapi({ example: "admin@example.com" }),
    name: z.string().openapi({ example: "Admin User" }),
    role: z.enum(ROLES).nullable().openapi({ example: "admin" }),
    banned: z.boolean().nullable().openapi({ example: false }),
  })
  .openapi("User");

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

export const UpdateUserRoleResponseSchema = createSuccessResponseSchema(
  z.object({
    id: z.string().openapi({ example: "user-123" }),
    email: z.email().openapi({ example: "user@example.com" }),
    role: z.enum(ROLES).nullable().openapi({ example: "admin" }),
  }),
);


export const UpdateAdminParamsSchema = z.object({
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    example: "user-123",
  }),
});

export const UpdateAdminBodySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
});

export const DeleteAdminParamsSchema = z.object({
  id: z.string().openapi({
    param: { name: "id", in: "path" },
    example: "user-456",
  }),
});
