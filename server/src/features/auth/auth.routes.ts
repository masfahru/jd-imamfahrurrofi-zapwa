import { Hono } from "hono";
import { auth } from "./auth.config";

const app = new Hono();

// Mounts all better-auth routes like /sign-in/email, /sign-out, etc.
app.on(["GET", "POST"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default app;
