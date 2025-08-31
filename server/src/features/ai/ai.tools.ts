import { z } from "zod";
import { tool } from '@langchain/core/tools';
import { createOrder as createOrderService, getOrderByCustomerPhoneAndId } from "@server/features/order/order.service";
import { chatSessions, type Product } from "@server/core/db/schema";
import { db } from "@server/core/db/drizzle";
import { chatMessages } from "@server/core/db/schema";
import { and, eq, isNotNull, desc } from "drizzle-orm";

const createLocalOrderToolSchema = z.object({
  customer: z.object({
    name: z.string().describe("The full name of the customer placing the order."),
    phone: z.string().describe("The active phone number for the customer."),
  }).describe("An object containing the customer's contact details."),
  cart: z.array(z.object({
    productId: z.string().describe("The unique identifier of the product from the catalog."),
    qty: z.number().int().positive().describe("The quantity of the product to be ordered."),
  })).min(1).describe("An array of products the customer wishes to purchase."),
});

const localOrderStatusToolSchema = z.object({
  orderId: z.string().optional().describe("The ID of the order, as provided by the customer. If not provided, the system will try to use the last known order ID from the current session."),
  phone: z.string().optional().describe("The customer's phone number used to verify their identity. If not provided, the system will try to use the last known phone number from the current session."),
});

/**
 * Creates and configures the tool for creating a local order.
 * This tool integrates with the existing order service to finalize purchases.
 * @param licenseId - The license ID of the user to scope the order creation.
 * @param productCatalog - The list of available products for validation.
 * @returns A configured LangChain tool for order creation.
 */
export const getCreateOrderTool = (licenseId: string, productCatalog: Product[]) => {
  const executeCreateOrder = async (input: unknown) => {
    try {
      const { customer, cart } = createLocalOrderToolSchema.parse(input);
      const itemsWithIds = cart.map(item => {
        const product = productCatalog.find(p => p.id === item.productId);
        if (!product) {
          // This provides a clear feedback loop to the AI if it hallucinates an ID.
          return `Product with ID "${item.productId}" not found in catalog. Please use a valid ID.`;
        }
        return { productId: product.id, quantity: item.qty };
      });

      // Check if any product was not found.
      const notFoundError = itemsWithIds.find(item => typeof item === 'string');
      if (notFoundError) return notFoundError as string;

      const validItems = itemsWithIds as {
        productId: string;
        quantity: number
      }[];

      const newOrder = await createOrderService(licenseId, {
        items: validItems,
        customer,
      });

      // Format the order details for the confirmation message
      const orderId = newOrder.id.slice(0, 8).toUpperCase();
      const total = (newOrder.totalAmount1000 / 1000).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      });
      const itemsSummary = newOrder.items
        .map((item) => `- ${item.quantity}x ${item.productName}`)
        .join('\n');

      return `Order created successfully for ${customer.name}! Here are the details:
Order ID: #${orderId}
Items:
${itemsSummary}
Total Price: ${total}
Thank you for your order!`;
    } catch (e) {
      const errorMessage = e instanceof Error ?
        e.message : "An unknown error occurred during tool execution.";
      return `Failed to execute tool. Reason: ${errorMessage}`;
    }
  };
  return tool(executeCreateOrder, {
    name: "create_local_order",
    description: "Creates a new order in the system with the customer's details and cart items. Only use this tool when all required information has been gathered from the user.",
    schema: createLocalOrderToolSchema,
  });
};

/**
 * Creates and configures the tool for checking an order's status.
 * This improved version searches the chat history more reliably for context.
 * @param licenseId - The license ID of the user to scope the order search.
 * @param sessionId - The ID of the current chat session to search for context.
 * @returns A configured LangChain tool for order status checks.
 */
export const getLocalOrderStatusTool = (licenseId: string, sessionId: string) => {
  const executeGetOrderStatus = async (input: unknown): Promise<string> => {
    try {
      const { orderId: providedOrderId, phone: providedPhone } = localOrderStatusToolSchema.parse(input);

      let orderId = providedOrderId;
      let phone = providedPhone;

      // If either argument is missing, search the history more comprehensively
      if (!orderId || !phone) {
        // First, search for assistant messages with tool calls (most reliable)
        const recentAssistantMessages = await db.query.chatMessages.findMany({
          where: and(
            eq(chatMessages.sessionId, sessionId),
            eq(chatMessages.role, 'assistant'),
            isNotNull(chatMessages.toolCalls)
          ),
          orderBy: [desc(chatMessages.createdAt)],
          limit: 10,
        });

        for (const msg of recentAssistantMessages) {
          if (msg.toolCalls) {
            try {
              // Handle both array and single tool call formats
              const toolCalls = Array.isArray(msg.toolCalls) ? msg.toolCalls : [msg.toolCalls];

              for (const call of toolCalls) {
                if (typeof call === 'object' && call !== null) {
                  // Check if this is a local_order_status tool call
                  if (('name' in call && call.name === 'local_order_status') ||
                    ('function' in call && call.function?.name === 'local_order_status')) {

                    // Extract args from different possible structures
                    let args = null;
                    if ('args' in call) {
                      args = call.args;
                    } else if ('arguments' in call) {
                      args = call.arguments;
                    } else if ('function' in call && call.function?.arguments) {
                      // Handle OpenAI function call format
                      try {
                        args = typeof call.function.arguments === 'string'
                          ? JSON.parse(call.function.arguments)
                          : call.function.arguments;
                      } catch (e) {
                        console.warn('Failed to parse function arguments:', e);
                      }
                    }

                    if (args && typeof args === 'object') {
                      if (!orderId && args.orderId) {
                        orderId = args.orderId;
                        console.log('Found orderId from tool call:', orderId);
                      }
                      if (!phone && args.phone) {
                        phone = args.phone;
                        console.log('Found phone from tool call:', phone);
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.warn('Error parsing tool calls:', error);
            }
          }
        }

        // Search for order confirmation messages (tool responses) for order ID
        if (!orderId) {
          const recentToolMessages = await db.query.chatMessages.findMany({
            where: and(
              eq(chatMessages.sessionId, sessionId),
              eq(chatMessages.role, 'tool')
            ),
            orderBy: [desc(chatMessages.createdAt)],
            limit: 10,
          });

          for (const msg of recentToolMessages) {
            // Look for order creation confirmations
            if (msg.content.includes('Order created successfully') ||
              msg.content.includes('Order ID:') ||
              msg.content.includes('order #')) {
              const orderIdMatch = msg.content.match(/(?:Order ID:|order #)[\s#]*([A-Z0-9]{8})/i);
              if (orderIdMatch && !orderId) {
                orderId = orderIdMatch[1];
                break;
              }
            }
          }
        }

        // If we still don't have phone, try to get it from the session's customer identifier
        if (!phone) {
          const session = await db.query.chatSessions.findFirst({
            where: eq(chatSessions.id, sessionId),
          });
          if (session?.customerIdentifier) {
            phone = session.customerIdentifier
          }
        }

        // Also search user messages for any mentions of order ID or phone
        if (!orderId || !phone) {
          const recentUserMessages = await db.query.chatMessages.findMany({
            where: and(
              eq(chatMessages.sessionId, sessionId),
              eq(chatMessages.role, 'user')
            ),
            orderBy: [desc(chatMessages.createdAt)],
            limit: 10,
          });

          for (const msg of recentUserMessages) {
            if (!orderId) {
              // Look for order ID patterns in user messages
              const orderIdMatch = msg.content.match(/(?:order|#)[\s#]*([A-Z0-9]{8})/i);
              if (orderIdMatch) {
                orderId = orderIdMatch[1];
                console.log('Found orderId from user message:', orderId);
              }
            }
            if (!phone) {
              // Look for phone number patterns
              const phoneMatch = msg.content.match(/(\+?[\d\s\-()]{10,})/);
              if (phoneMatch) {
                phone = phoneMatch[1] && phoneMatch[1].replace(/[\s\-()]/g, '');
              }
            }
          }
        }
      }

      if (!orderId || !phone) {
        return "I need both the Order ID and the customer's phone number to check the status. Could you please provide them?";
      }

      const order = await getOrderByCustomerPhoneAndId(licenseId, orderId, phone);

      if (!order) {
        return `I could not find an order with the ID starting with '${orderId}' for the phone number '${phone}'. Please check the details and try again.`;
      }

      return `The status for order #${order.id.slice(0, 8).toUpperCase()} for customer ${order.customerName} is '${order.status}'.`;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during tool execution.";
      console.error('Error in getLocalOrderStatusTool:', errorMessage);
      return `Failed to execute tool. Reason: ${errorMessage}`;
    }
  };

  return tool(executeGetOrderStatus, {
    name: "local_order_status",
    description: "Checks the status of a specific order for a customer. This tool will automatically try to reuse the order ID and phone number from previous successful interactions in the current conversation. If the order ID and phone number were used before in this session, you can call this tool without parameters to check the status again.",
    schema: localOrderStatusToolSchema,
  });
};
