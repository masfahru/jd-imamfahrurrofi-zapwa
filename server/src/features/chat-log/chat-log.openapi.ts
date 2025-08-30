import { createRoute } from "@hono/zod-openapi";
import { requireAuth, requireLicense } from "@server/core/middleware/auth.middleware";
import { ErrorSchema } from "@server/core/utils/response";
import { GetChatMessagesQuerySchema, PaginatedChatMessagesResponseSchema, } from "./chat-log.schema";

const userOnly = [requireAuth, requireLicense];

export const getChatMessagesRoute = createRoute({
  method: "get",
  path: "/chat-messages",
  middleware: userOnly,
  summary: "Get a paginated list of chat messages for the current user",
  tags: ["Chat Log"],
  request: {
    query: GetChatMessagesQuerySchema,
  },
  responses: {
    200: {
      description: "A paginated list of chat messages with token usage information",
      content: { "application/json": { schema: PaginatedChatMessagesResponseSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: ErrorSchema } },
    },
    403: {
      description: "Forbidden (No license)",
      content: { "application/json": { schema: ErrorSchema } },
    },
    500: {
      description: "Internal Server Error",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});
