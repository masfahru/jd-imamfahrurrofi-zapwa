import { z } from "@hono/zod-openapi";
import { createPaginatedResponseSchema, createSuccessResponseSchema } from "@server/core/utils/response";
import {UserSchema} from "@server/features/admin/admin.schema";

// Schema for a single license, optionally including user details
export const LicenseSchema = z.object({
  id: z.string(),
  key: z.string(),
  userId: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  user: UserSchema.pick({ id: true, name: true, email: true }).nullable().optional(),
}).openapi("License");

// Schema for assigning a license
export const AssignLicenseParamsSchema = z.object({
  userId: z.string().openapi({
    param: { name: 'userId', in: 'path' },
    example: 'user-123',
  }),
});

// Schema for reassigning a license
export const ReassignLicenseBodySchema = z.object({
  licenseId: z.string(),
  newUserId: z.string(),
});

// Schema for getting a list of licenses
export const GetLicensesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

export const MigrateLicenseDataBodySchema = z.object({
  sourceLicenseId: z.string(),
  targetLicenseId: z.string(),
});

// Response Schemas
export const PaginatedLicensesResponseSchema = createPaginatedResponseSchema(LicenseSchema);
export const SingleLicenseResponseSchema = createSuccessResponseSchema(LicenseSchema);
