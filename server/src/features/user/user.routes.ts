import { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import { requireAuth, requireRole, type User } from "@server/core/middleware/auth.middleware";
import { ErrorSchema } from "@server/core/utils/response";
import { getMe, signUpUserAndAssignLicense } from "./user.service";
import { jsonResponse } from "@server/core/utils/response";
import {
  MeResponseSchema,
  UserSignupBodySchema,
  UserSignupResponseSchema,
} from "./user.schema";

type UserEnv = { Variables: { user: User } };
export const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  middleware: [requireAuth, requireRole(["user"])],
  summary: "Get current user profile",
  tags: ["User"],
  responses: {
    200: {
      description: "User profile data",
      content: { "application/json": { schema: MeResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

export const userSignupRoute = createRoute({
  method: "post",
  path: "/sign-up",
  summary: "Create a new user and assign a license",
  tags: ["User"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserSignupBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: { "application/json": { schema: UserSignupResponseSchema } },
    },
    400: {
      description: "Bad Request (e.g., email already exists)",
      content: { "application/json": { schema: ErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const app = new OpenAPIHono<UserEnv>();

app.openapi(userSignupRoute, async (c) => {
  const { name, email, password } = c.req.valid("json");
  const newUser = await signUpUserAndAssignLicense(name, email, password);
  return jsonResponse(
    c,
    "User created successfully. You can now log in.",
    newUser,
    201,
  );
});

app.openapi(getMeRoute, async (c) => {
  const currentUser = c.get("user");
  const userProfile = await getMe(currentUser.id);
  return jsonResponse(c, "User profile retrieved successfully", userProfile);
});

export default app;
