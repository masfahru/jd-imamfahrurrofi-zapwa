import { createRoute } from "@hono/zod-openapi";
import { requireAuth, requireRole } from "@server/core/middleware/auth.middleware";
import { ErrorSchema } from "@server/core/utils/response";
import {
  AssignLicenseParamsSchema,
  GetLicensesQuerySchema,
  PaginatedLicensesResponseSchema,
  ReassignLicenseBodySchema,
  SingleLicenseResponseSchema
} from "./license.schema";

const adminRoles = ["admin", "super admin"] as const;

export const assignLicenseRoute = createRoute({
  method: 'post',
  path: '/users/{userId}/license',
  middleware: [requireAuth, requireRole([...adminRoles])],
  summary: 'Assign a new license to a user',
  tags: ['Licenses'],
  request: {
    params: AssignLicenseParamsSchema,
  },
  responses: {
    201: { description: 'License assigned successfully', content: { 'application/json': { schema: SingleLicenseResponseSchema } } },
    400: { description: 'Bad Request', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

export const removeLicenseRoute = createRoute({
  method: 'delete',
  path: '/users/{userId}/license',
  middleware: [requireAuth, requireRole([...adminRoles])],
  summary: 'Remove (unassign) a license from a user',
  tags: ['Licenses'],
  request: {
    params: AssignLicenseParamsSchema, // Same params as assign
  },
  responses: {
    200: { description: 'License removed successfully', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'User or license not found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

export const reassignLicenseRoute = createRoute({
  method: 'put',
  path: '/licenses/reassign',
  middleware: [requireAuth, requireRole([...adminRoles])],
  summary: 'Reassign a license to a new user',
  tags: ['Licenses'],
  request: {
    body: { content: { 'application/json': { schema: ReassignLicenseBodySchema } } },
  },
  responses: {
    200: { description: 'License reassigned successfully', content: { 'application/json': { schema: SingleLicenseResponseSchema } } },
    400: { description: 'Bad Request', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'Not Found', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

export const getLicensesRoute = createRoute({
  method: 'get',
  path: '/licenses',
  middleware: [requireAuth, requireRole([...adminRoles])],
  summary: 'Get a paginated list of all licenses',
  tags: ['Licenses'],
  request: {
    query: GetLicensesQuerySchema,
  },
  responses: {
    200: { description: 'List of licenses', content: { 'application/json': { schema: PaginatedLicensesResponseSchema } } },
  },
});
