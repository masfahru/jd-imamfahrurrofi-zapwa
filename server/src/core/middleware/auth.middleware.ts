// server/src/core/middleware/auth.middleware.ts
import { createMiddleware } from "hono/factory";
import { auth } from "../../features/auth/auth.config";

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

// Define the Admin Environment type here and export it.
export type AdminEnv = {
  Bindings: {}; // Add this line to make the Env complete
  Variables: {
    session: Session;
    user: User;
  };
};

// This middleware SETS the variables for AdminEnv.
export const requireAuth = createMiddleware<AdminEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session as Session);
  c.set("user", session.user as User);
  await next();
});

// This middleware USES the variables from AdminEnv.
export const requireRole = (requiredRoles: Array<User["role"]>) => {
  return createMiddleware<AdminEnv>(async (c, next) => {
    const user = c.get("user");

    if (!user || !user.role) {
      return c.json({ error: "Forbidden: No role assigned" }, 403);
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    const hasRequiredRole = userRoles.some((role) =>
      requiredRoles.includes(role),
    );

    if (!hasRequiredRole) {
      return c.json({ error: "Forbidden: Insufficient permissions" }, 403);
    }
    await next();
  });
};
