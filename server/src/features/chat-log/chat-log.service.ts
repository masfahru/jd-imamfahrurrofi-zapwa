import { db } from "@server/core/db/drizzle";
import { chatMessages, chatSessions } from "@server/core/db/schema";
import { and, count, desc, eq, ilike, inArray, SQL } from "drizzle-orm"

/**
 * Fetches a paginated list of chat messages for a specific license.
 * @param licenseId - The license ID to scope the search.
 * @param page - The page number (1-based).
 * @param limit - The number of items per page.
 * @param sessionId - Optional filter by specific session ID.
 * @param role - Optional filter by message role.
 * @param search - Optional search term for message content.
 * @returns A paginated list of chat messages with token usage information.
 */
export const getChatMessagesByLicenseId = async (
  licenseId: string,
  page: number,
  limit: number,
  sessionId?: string,
  role?: "user" | "assistant" | "tool" | "all",
  search?: string,
) => {
  const offset = (page - 1) * limit;

  // First, get all session IDs that belong to this license
  const licenseSessions = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(eq(chatSessions.licenseId, licenseId));

  const sessionIds = licenseSessions.map(s => s.id);

  if (sessionIds.length === 0) {
    // No sessions found for this license
    return {
      items: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: limit,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  // Build the where clause
  let whereClause: SQL | undefined = inArray(chatMessages.sessionId, sessionIds);

  // Add session filter if specified
  if (sessionId) {
    whereClause = and(whereClause, eq(chatMessages.sessionId, sessionId));
  }

  // Add role filter if specified and not "all"
  if (role && role !== "all") {
    whereClause = and(whereClause, eq(chatMessages.role, role));
  }

  // Add search filter if specified
  if (search) {
    whereClause = and(whereClause, ilike(chatMessages.content, `%${search}%`));
  }

  // Get total count for pagination
  const totalItemsResult = await db
    .select({ value: count() })
    .from(chatMessages)
    .where(whereClause);

  const totalItems = totalItemsResult[0]?.value || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Get the chat messages for the current page
  const messages = await db
    .select({
      id: chatMessages.id,
      sessionId: chatMessages.sessionId,
      role: chatMessages.role,
      content: chatMessages.content,
      tokenUsage: chatMessages.tokenUsage,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(whereClause)
    .orderBy(desc(chatMessages.createdAt))
    .offset(offset)
    .limit(limit);

  // Transform the results to flatten token usage data
  const transformedMessages = messages.map(msg => {
    const tokenUsage = msg.tokenUsage as {
      totalTokens?: number;
      promptTokens?: number;
      completionTokens?: number;
    } | null;

    return {
      id: msg.id,
      sessionId: msg.sessionId,
      role: msg.role as "user" | "assistant" | "tool",
      content: msg.content,
      totalTokens: tokenUsage?.totalTokens || null,
      promptTokens: tokenUsage?.promptTokens || null,
      completionTokens: tokenUsage?.completionTokens || null,
      createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
    };
  });

  return {
    items: transformedMessages,
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
