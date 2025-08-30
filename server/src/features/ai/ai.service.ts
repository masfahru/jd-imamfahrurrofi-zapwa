import { db } from "@server/core/db/drizzle";
import { aiAgents, chatMessages } from "@server/core/db/schema";
import { getProductsByLicenseId } from "@server/features/product/product.service";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { auth } from "@server/features/auth/auth.config";
import { randomUUIDv7 } from "bun";
import { getCreateOrderTool } from "./ai.tools";
import { formatProductsForPrompt, getSystemPrompt } from "./ai.prompts";
import { closeSession, getOrCreateSession } from "./ai.session.manager";
import { HTTPException } from "hono/http-exception";
import { and, count, desc, eq, ne } from "drizzle-orm";

/**
 * Main handler for processing an incoming chat message from a customer.
 * It orchestrates fetching context, managing sessions, invoking the LLM, and handling tool calls.
 *
 * @param licenseId - The license ID of the ZapWA user.
 * @param sessionId - The current session ID (or null to start a new one).
 * @param userMessage - The message from the end-customer.
 * @param customerIdentifier - A unique ID for the customer (e.g., phone number).
 * @returns An object containing the new/current session ID and the AI's response.
 */
export async function handleChatMessage(
  licenseId: string,
  sessionId: string | null,
  userMessage: string,
  customerIdentifier: string
) {
  const generateId = (await auth.$context).generateId;
  const session = await getOrCreateSession(licenseId, sessionId, customerIdentifier);
  const currentSessionId = session.id;

  const productData = await getProductsByLicenseId(licenseId, 1, 1000);
  const formattedProducts = formatProductsForPrompt(productData.items);

  const activeAgent = await db.query.aiAgents.findFirst({
    where: and(
      eq(aiAgents.licenseId, licenseId),
      eq(aiAgents.isActive, true)
    ),
  });
  const agentBehavior = activeAgent ? activeAgent.behavior : "";
  const systemPrompt = getSystemPrompt(formattedProducts, agentBehavior);

  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });
  const createOrderTool = getCreateOrderTool(licenseId, productData.items);
  const llmWithTools = llm.bindTools([createOrderTool]);

  const history: BaseMessage[] = [new SystemMessage(systemPrompt)];
  session.messages.forEach(msg => {
    if (msg.role === 'user') history.push(new HumanMessage(msg.content));
    else if (msg.role === 'assistant') history.push(new AIMessage(msg.content));
  });
  history.push(new HumanMessage(userMessage));

  await db.insert(chatMessages).values({
    id: generateId({ model: 'message' }) || randomUUIDv7(),
    sessionId: currentSessionId,
    role: 'user',
    content: userMessage,
  });

  const aiResponse = await llmWithTools.invoke(history);

  let assistantReply: string;
  let newSessionIdForResponse = currentSessionId;

  if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
    history.push(aiResponse);

    const toolCall = aiResponse.tool_calls[0];
    // Add the check for toolCall.id to satisfy TypeScript
    if (toolCall && toolCall.name === 'create_local_order' && toolCall.id) {
      console.log("Invoking create_local_order tool with args:", toolCall.args);
      const toolResult = await createOrderTool.invoke(toolCall.args);

      history.push(new ToolMessage({
        content: toolResult,
        tool_call_id: toolCall.id,
      }));
      assistantReply = `I've created your order! ${toolResult}`;
      try {
        console.log("Invoking LLM for the second time to synthesize the final response...");
        const finalResponse = await llm.invoke(history);
        assistantReply = finalResponse.content.toString();
      } catch (e) {
        console.log(e)
      }

      await closeSession(currentSessionId);
      const newSession = await getOrCreateSession(licenseId, null, customerIdentifier);
      newSessionIdForResponse = newSession.id;
    } else {
      assistantReply = "I was about to perform an action, but there was an issue. Please clarify your request.";
    }
  } else {
    assistantReply = aiResponse.content.toString();
  }

  await db.insert(chatMessages).values({
    id: generateId({ model: 'message' }) || randomUUIDv7(),
    sessionId: newSessionIdForResponse,
    role: 'assistant',
    content: assistantReply,
    toolCalls: aiResponse.tool_calls ?? null,
  });

  return {
    sessionId: newSessionIdForResponse,
    response: assistantReply,
  };
}

/**
 * Creates a new AI Agent. If it's the first agent for the license, it's set to active.
 */
export const createAgent = async (licenseId: string, data: { name: string; behavior: string }) => {
  const generateId = (await auth.$context).generateId;
  const newAgentId = generateId({ model: "ai_agent" }) || randomUUIDv7();

  // Check if this will be the first agent for the license
  const agentCountResult = await db.select({ value: count() }).from(aiAgents).where(eq(aiAgents.licenseId, licenseId));
  const isFirstAgent = (agentCountResult[0]?.value ?? 0) === 0;

  const [newAgent] = await db
    .insert(aiAgents)
    .values({
      id: newAgentId,
      licenseId,
      ...data,
      isActive: isFirstAgent // Set to true if it's the first one
    })
    .returning();

  if (!newAgent) {
    throw new HTTPException(500, { message: "Failed to create AI agent." });
  }
  return newAgent;
};

/**
 * Sets a specific AI agent as active for a license, deactivating all others.
 */
export const setActiveAgent = async (licenseId: string, agentId: string) => {
  const agentToActivate = await db.query.aiAgents.findFirst({
    where: and(eq(aiAgents.id, agentId), eq(aiAgents.licenseId, licenseId)),
  });

  if (!agentToActivate) {
    throw new HTTPException(404, { message: "AI Agent not found." });
  }

  // Use a transaction to ensure atomicity
  await db.transaction(async (tx) => {
    // Deactivate all other agents for this license
    await tx
      .update(aiAgents)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(aiAgents.licenseId, licenseId), ne(aiAgents.id, agentId)));

    // Activate the selected agent
    await tx
      .update(aiAgents)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(aiAgents.id, agentId));
  });

  // Return the newly activated agent
  return db.query.aiAgents.findFirst({ where: eq(aiAgents.id, agentId) });
};

/**
 * Fetches all AI Agents for a specific license with pagination.
 */
export const getAgentsByLicenseId = async (
  licenseId: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  // Clause for filtering by license
  const whereClause = eq(aiAgents.licenseId, licenseId);

  // Get total count for pagination metadata
  const totalItemsResult = await db
    .select({ value: count() })
    .from(aiAgents)
    .where(whereClause);
  const totalItems = totalItemsResult[0]?.value ?? 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Get the agents for the current page
  const agents = await db.query.aiAgents.findMany({
    where: whereClause,
    orderBy: [desc(aiAgents.createdAt)],
    offset,
    limit,
  });

  return {
    items: agents,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Updates an existing AI Agent.
 */
export const updateAgent = async (licenseId: string, agentId: string, data: { name?: string; behavior?: string }) => {
  const [updatedAgent] = await db
    .update(aiAgents)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(aiAgents.id, agentId), eq(aiAgents.licenseId, licenseId)))
    .returning();

  if (!updatedAgent) {
    throw new HTTPException(404, { message: "AI Agent not found or you do not have permission to edit it." });
  }
  return updatedAgent;
};

/**
 * Deletes an AI Agent, preventing deletion of the active agent.
 */
export const deleteAgent = async (licenseId: string, agentId: string) => {
  // First, check if the agent to be deleted is active
  const agent = await db.query.aiAgents.findFirst({
    where: and(eq(aiAgents.id, agentId), eq(aiAgents.licenseId, licenseId)),
  });

  if (!agent) {
    throw new HTTPException(404, { message: "AI Agent not found." });
  }

  if (agent.isActive) {
    throw new HTTPException(400, { message: "Cannot delete the active agent. Please activate another agent first." });
  }

  const [deletedAgent] = await db
    .delete(aiAgents)
    .where(eq(aiAgents.id, agentId)) // licenseId check already done
    .returning({ id: aiAgents.id });

  if (!deletedAgent) {
    // This case should ideally not be reached due to the check above
    throw new HTTPException(404, { message: "AI Agent not found or you do not have permission to delete it." });
  }
  return deletedAgent;
};
