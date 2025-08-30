import { OpenAPIHono } from "@hono/zod-openapi";
import { type UserEnv } from "@server/core/middleware/auth.middleware";
import { jsonResponse } from "@server/core/utils/response";
import { getChatMessagesRoute } from "./chat-log.openapi";
import { getChatMessagesByLicenseId } from "./chat-log.service";

const app = new OpenAPIHono<UserEnv>();

app.openapi(getChatMessagesRoute, async (c) => {
  const license = c.get("license");
  const { page, limit, sessionId, role, search } = c.req.valid("query");

  const result = await getChatMessagesByLicenseId(
    license.id,
    parseInt(page),
    parseInt(limit),
    sessionId,
    role === "all" ? undefined : role,
    search,
  );

  return jsonResponse(c, "Chat messages retrieved successfully", result);
});

export default app;
