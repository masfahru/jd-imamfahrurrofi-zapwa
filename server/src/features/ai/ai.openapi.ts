import {createRoute, z} from "@hono/zod-openapi";
import { requireAuth, requireLicense } from "@server/core/middleware/auth.middleware";
import {createSuccessResponseSchema, ErrorSchema} from "@server/core/utils/response";
import {
  AgentIdParamsSchema,
  ChatRequestSchema, ChatResponseSchema, CreateAgentBodySchema,
  PaginatedAgentsResponseSchema, SingleAgentResponseSchema, UpdateAgentBodySchema
} from "./ai.schema";

const userOnly = [requireAuth, requireLicense];

export const aiChatRoute = createRoute({
  method: "post",
  path: "/chat",
  middleware: userOnly,
  summary: "Interact with the AI customer service agent",
  tags: ["AI"],
  request: {
    body: {
      content: { "application/json": { schema: ChatRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "AI response generated successfully",
      content: { "application/json": { schema: ChatResponseSchema } },
    },
    401: { description: "Unauthorized", content: { "application/json": { schema: ErrorSchema } } },
    403: { description: "Forbidden (No license)", content: { "application/json": { schema: ErrorSchema } } },
    500: { description: "Internal Server Error", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const createAgentRoute = createRoute({
  method: "post",
  path: "/agents",
  middleware: userOnly,
  summary: "Create a new AI agent configuration",
  tags: ["AI Agents"],
  request: { body: { content: { "application/json": { schema: CreateAgentBodySchema } } } },
  responses: {
    201: { description: "Agent created", content: { "application/json": { schema: SingleAgentResponseSchema } } },
  },
});

export const getAgentsRoute = createRoute({
  method: "get",
  path: "/agents",
  middleware: userOnly,
  summary: "Get all AI agent configurations for the user",
  tags: ["AI Agents"],
  responses: {
    200: { description: "List of agents", content: { "application/json": { schema: PaginatedAgentsResponseSchema } } },
  },
});

export const updateAgentRoute = createRoute({
  method: "put",
  path: "/agents/{id}",
  middleware: userOnly,
  summary: "Update an AI agent configuration",
  tags: ["AI Agents"],
  request: {
    params: AgentIdParamsSchema,
    body: { content: { "application/json": { schema: UpdateAgentBodySchema } } },
  },
  responses: {
    200: { description: "Agent updated", content: { "application/json": { schema: SingleAgentResponseSchema } } },
    404: { description: "Agent not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const deleteAgentRoute = createRoute({
  method: "delete",
  path: "/agents/{id}",
  middleware: userOnly,
  summary: "Delete an AI agent configuration",
  tags: ["AI Agents"],
  request: { params: AgentIdParamsSchema },
  responses: {
    200: { description: "Agent deleted", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string() })) } } },
    404: { description: "Agent not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const setActiveAgentRoute = createRoute({
  method: "put",
  path: "/agents/{id}/activate",
  middleware: userOnly,
  summary: "Set an AI agent as the active one for the user",
  tags: ["AI Agents"],
  request: { params: AgentIdParamsSchema },
  responses: {
    200: { description: "Agent activated", content: { "application/json": { schema: SingleAgentResponseSchema } } },
    404: { description: "Agent not found", content: { "application/json": { schema: ErrorSchema } } },
  },
});
