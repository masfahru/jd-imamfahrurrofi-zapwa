import { Hono } from "hono";
import {
  requireAuth,
  requireRole,
  type AdminEnv,
} from "../../core/middleware/auth.middleware";
import { AdminService } from "./admin.service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ROLES } from "../../core/db/schema";

// Instantiate Hono with the imported and consistent environment type
const app = new Hono<AdminEnv>();
const adminService = new AdminService();

// Middleware to protect all /api/admin/* routes
app.use("/*", requireAuth, requireRole(["admin", "super admin"]));

// Endpoint for super admins to manage other admins' roles
app.post(
  "/users/:id/role",
  requireRole(["super admin"]),
  zValidator(
    "json",
    z.object({
      role: z.enum(ROLES),
    }),
  ),
  async (c) => {
    const targetUserId = c.req.param("id");
    const { role } = c.req.valid("json");

    try {
      const updatedUser = await adminService.setUserRole(targetUserId, role);
      return c.json({
        message: "User role updated successfully",
        user: updatedUser,
      });
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
  },
);

// Endpoint for super admins to list all admins
app.get("/users", requireRole(["super admin"]), async (c) => {
  try {
    const admins = await adminService.getAdmins();
    return c.json(admins);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch admins" }, 500);
  }
});

export default app;
