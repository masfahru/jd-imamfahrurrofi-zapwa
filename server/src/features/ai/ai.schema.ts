import { z } from "@hono/zod-openapi";
import { createPaginatedResponseSchema, createSuccessResponseSchema } from "@server/core/utils/response";

// Request body schema
export const ChatRequestSchema = z.object({
  sessionId: z.string().nullable().openapi({
    example: "session-123",
    description: "The ID of the current chat session, or null for a new conversation.",
  }),
  message: z.string().min(1).openapi({
    example: "Hello, do you have any red shirts?",
    description: "The user's message.",
  }),
  customerIdentifier: z.string().min(1).openapi({
    example: "+6281234567890",
    description: "A unique identifier for the end-customer, like a phone number.",
  }),
});

// Success response schema
export const ChatResponseSchema = createSuccessResponseSchema(
  z.object({
    sessionId: z.string().openapi({
      example: "session-abc-123",
      description: "The ID of the current or new chat session.",
    }),
    response: z.string().openapi({
      example: "Yes, we have red shirts in stock!",
      description: "The AI assistant's reply.",
    }),
  })
);

// Schema for a single AI Agent
export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  behavior: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi("AIAgent");

// Schemas for creating/updating an agent
export const CreateAgentBodySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  behavior: z.string().min(10, "Behavior description must be at least 10 characters."),
});
export const UpdateAgentBodySchema = CreateAgentBodySchema.partial();

// Schema for URL params
export const AgentIdParamsSchema = z.object({
  id: z.string().openapi({
    param: { name: 'id', in: 'path' },
    example: 'agent-123',
  }),
});

// Response Schemas
export const SingleAgentResponseSchema = createSuccessResponseSchema(AgentSchema);
export const PaginatedAgentsResponseSchema = createPaginatedResponseSchema(AgentSchema);
