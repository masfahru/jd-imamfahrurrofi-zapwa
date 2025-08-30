import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from 'hono/logger';
import { allowedOrigins } from "./core/config/origins";
import authRoutes from "./features/auth/auth.routes";
import adminRoutes from "./features/admin/admin.routes";
import userRoutes from "@server/features/user/user.routes";
import productRoutes from "@server/features/product/product.routes";
import orderRoutes from "@server/features/order/order.routes";
import aiRoutes from "@server/features/ai/ai.routes";
import chatLogRoutes from "@server/features/chat-log/chat-log.routes";

type AppEnv = object;
export const app = new OpenAPIHono<{ Bindings: AppEnv }>().basePath("/api");

app.use(logger());
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ message: err.message }, err.status as never);
	}
	console.error("Unhandled Application Error:", err);
	return c.json({ message: "Internal Server Error" }, 500);
});
app.use(
	"*",
	cors({
		origin: (origin) => {
			if (allowedOrigins.includes(origin)) {
				return origin;
			}
			return;
		},
		credentials: true,
	}),
);

app.route("/auth", authRoutes);
app.route("/admin", adminRoutes);
app.route("/user", userRoutes);
app.route("/user/products", productRoutes);
app.route("/user/orders", orderRoutes);
app.route("/user/ai", aiRoutes);
app.route("/user", chatLogRoutes);

app.get("/", (c) => {
	return c.text("Welcome to the ZapWA API!");
});

app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "ZapWA API",
	},
});
app.get('/reference', Scalar({ url: '/api/doc' }))

export default app;
