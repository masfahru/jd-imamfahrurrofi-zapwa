import { db } from "@server/core/db/drizzle";
import { chatMessages, chatSessions } from "@server/core/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@server/features/auth/auth.config";
import { randomUUIDv7 } from "bun";
import { HTTPException } from "hono/http-exception"; // Import HTTPException

/**
 * Retrieves an existing active session or creates a new one.
 * @param licenseId - The license ID to associate the session with.
 * @param sessionId - The ID of an existing session, if any.
 * @param customerIdentifier - A unique identifier for the customer.
 * @returns The session object, including recent messages.
 * @throws HTTPException if a new session fails to be created.
 */
export const getOrCreateSession = async (
  licenseId: string,
  sessionId: string | null,
  customerIdentifier: string
) => {
  if (sessionId) {
    const session = await db.query.chatSessions.findFirst({
      where: and(eq(chatSessions.id, sessionId), eq(chatSessions.isActive, true)),
      with: { messages: { orderBy: [chatMessages.createdAt], limit: 10 } }
    });
    if (session) {
      return session;
    }
  }

  const generateId = (await auth.$context).generateId;
  const newSessionId = generateId({ model: 'session' }) || randomUUIDv7();
  const [newSession] = await db.insert(chatSessions).values({
    id: newSessionId,
    licenseId,
    customerIdentifier,
  }).returning();

  // --- FIX: Add this check ---
  if (!newSession) {
    throw new HTTPException(500, { message: "Failed to create a new chat session in the database." });
  }
  // --- END FIX ---

  return { ...newSession, messages: [] };
};

/**
 * Closes a chat session by setting its `isActive` flag to false.
 * @param sessionId - The ID of the session to close.
 */
export const closeSession = async (sessionId: string) => {
  await db.update(chatSessions)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(chatSessions.id, sessionId));
};
