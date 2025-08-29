import { OpenAPIHono } from "@hono/zod-openapi";
import type { AdminEnv } from "@server/core/middleware/auth.middleware";
import {
  getAdmins,
  setUserRole,
  getUsers,
} from "@server/features/admin/admin.service";
import {
  getAdminsRoute,
  setUserRoleRoute,
  getUsersRoute,
} from "./admin.openapi";

const app = new OpenAPIHono<AdminEnv>();

app.openAPIRegistry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
});

app.openapi(getAdminsRoute, async (c) => {
  try {
    const admins = await getAdmins();
    return c.json(admins, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch admins" }, 500);
  }
});

app.openapi(getUsersRoute, async (c) => {
  try {
    const users = await getUsers();
    return c.json(users, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

app.openapi(setUserRoleRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { role } = c.req.valid("json");

  try {
    const updatedUser = await setUserRole(id, role);
    return c.json(
      {
        message: "User role updated successfully",
        user: updatedUser,
      },
      200
    );
  } catch (error: any) {
    if (
      error.message === "The primary super admin cannot be demoted." ||
      error.message === "User not found."
    ) {
      return c.json({ error: error.message }, 400);
    }
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default app;
