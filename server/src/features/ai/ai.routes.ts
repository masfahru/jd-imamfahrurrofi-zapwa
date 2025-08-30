import { OpenAPIHono } from "@hono/zod-openapi";
import { type UserEnv } from "@server/core/middleware/auth.middleware";
import { jsonResponse } from "@server/core/utils/response";
import {
  aiChatRoute,
  createAgentRoute,
  deleteAgentRoute,
  getAgentsRoute,
  setActiveAgentRoute,
  updateAgentRoute
} from "./ai.openapi";
import {
  createAgent,
  deleteAgent,
  getAgentsByLicenseId,
  handleChatMessage,
  setActiveAgent,
  updateAgent
} from "./ai.service";

const app = new OpenAPIHono<UserEnv>();

app.openapi(aiChatRoute, async (c) => {
  const license = c.get("license");
  const { sessionId, message, customerIdentifier } = c.req.valid("json");

  const result = await handleChatMessage(
    license.id,
    sessionId,
    message,
    customerIdentifier
  );

  return jsonResponse(c, "Reply generated successfully", result);
});

app.openapi(createAgentRoute, async (c) => {
  const license = c.get("license");
  const agentData = c.req.valid("json");
  const newAgent = await createAgent(license.id, agentData);
  return jsonResponse(c, "AI Agent created successfully", newAgent, 201);
});

app.openapi(getAgentsRoute, async (c) => {
  const license = c.get("license");
  const { page = '1', limit = '10' } = c.req.query();
  const result = await getAgentsByLicenseId(license.id, parseInt(page), parseInt(limit));
  return jsonResponse(c, "AI Agents retrieved successfully", result);
});

app.openapi(updateAgentRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");
  const agentData = c.req.valid("json");
  const updated = await updateAgent(license.id, id, agentData);
  return jsonResponse(c, "AI Agent updated successfully", updated);
});

app.openapi(deleteAgentRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");
  const deleted = await deleteAgent(license.id, id);
  return jsonResponse(c, "AI Agent deleted successfully", deleted);
});

app.openapi(setActiveAgentRoute, async (c) => {
  const license = c.get("license");
  const { id } = c.req.valid("param");
  const activatedAgent = await setActiveAgent(license.id, id);
  return jsonResponse(c, "AI Agent activated successfully", activatedAgent);
});

export default app;
