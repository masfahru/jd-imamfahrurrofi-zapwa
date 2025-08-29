import { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { requireAuth, requireRole, type User } from "@server/core/middleware/auth.middleware";
import { createSuccessResponseSchema, ErrorSchema } from "@server/core/utils/response";
import { getMe } from "./user.service";
import { jsonResponse } from "@server/core/utils/response";
import { ROLES } from "@server/core/db/schema";

type UserEnv = { Variables: { user: User } };

// Define the response schema for the 'me' endpoint
const MeResponseSchema = createSuccessResponseSchema(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(ROLES),
    licenseKey: z.string().nullable(),
  })
);

// Define the route documentation
export const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  middleware: [requireAuth, requireRole(['user'])],
  summary: 'Get current user profile',
  tags: ['User'],
  responses: {
    200: { description: 'User profile data', content: { 'application/json': { schema: MeResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
    404: { description: 'User not found', content: { 'application/json': { schema: ErrorSchema } } },
  }
});

const app = new OpenAPIHono<UserEnv>();

app.openapi(getMeRoute, async (c) => {
  const currentUser = c.get('user');
  const userProfile = await getMe(currentUser.id);
  return jsonResponse(c, 'User profile retrieved successfully', userProfile);
});

export default app;
