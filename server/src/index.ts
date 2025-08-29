import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from "hono/cors";
import authRoutes from "./features/auth/auth.routes";
import adminRoutes from "./features/admin/admin.routes";

type AppEnv = {
	// You can define environment variables here for type safety
};

export const app = new OpenAPIHono<{ Bindings: AppEnv }>().basePath("/api");

app.use("*", cors());

// Mount feature-specific routes
// The OpenAPIHono app will discover routes from the adminRoutes sub-app.
app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);

app.get("/", (c) => {
	return c.text("Welcome to the ZapWA API!");
});

// Generate the OpenAPI specification at /api/doc
app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "ZapWA API",
	},
});

app.get('/reference', Scalar({ url: '/api/doc' }))

export default app;
