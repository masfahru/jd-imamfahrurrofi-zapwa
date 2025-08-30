import { z } from "@hono/zod-openapi";
import { createPaginatedResponseSchema } from "@server/core/utils/response";

// Schema for token usage information
export const TokenUsageSchema = z.object({
  totalTokens: z.number().int().nullable(),
  promptTokens: z.number().int().nullable(),
  completionTokens: z.number().int().nullable(),
}).openapi("TokenUsage");

// Schema for a single chat message in the log
export const ChatMessageLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
  totalTokens: z.number().int().nullable(),
  promptTokens: z.number().int().nullable(),
  completionTokens: z.number().int().nullable(),
  createdAt: z.iso.datetime(),
}).openapi("ChatMessageLog");

// Schema for query parameters when fetching chat messages
export const GetChatMessagesQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  sessionId: z.string().optional(),
  role: z.enum(["user", "assistant", "tool", "all"]).optional().default("all"),
  search: z.string().optional(),
});

// Response schema for paginated chat messages
export const PaginatedChatMessagesResponseSchema = createPaginatedResponseSchema(ChatMessageLogSchema);
