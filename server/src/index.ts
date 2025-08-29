import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./features/auth/auth.routes";
import adminRoutes from "./features/admin/admin.routes";

// Define custom types for Hono's context if needed
type AppEnv = {
	// You can define environment variables here for type safety
};

export const app = new Hono<{ Bindings: AppEnv }>().basePath("/api");

app.use("*", cors());

// Mount feature-specific routes
app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);

app.get("/", (c) => {
	return c.text("Welcome to the ZapWA API!");
});

export default app;
