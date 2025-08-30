import type { Product } from "@server/core/db/schema";

/**
 * Formats an array of product objects into a readable string for the AI's context.
 * This version includes the product ID to be used by the AI tool.
 * @param products - An array of product objects.
 * @returns A string catalog of the products.
 */
export const formatProductsForPrompt = (products: Product[]): string => {
  if (!products || products.length === 0) {
    return "No products are available in the catalog.";
  }
  return products.map(p =>
    // Add the product ID to the information available to the AI.
    `- ID: ${p.id}\n  Name: ${p.name}\n  Description: ${p.description || 'N/A'}\n  Price: IDR ${(p.priceAmount1000 / 1000).toLocaleString('id-ID')}`
  ).join("\n\n");
};

/**
 * Generates the main system prompt for the AI assistant.
 * This version includes instructions on how to use product IDs with tools.
 * @param formattedProducts - The stringified product catalog.
 * @param agentBehavior - The user-defined behavior for the AI.
 * @returns The complete system prompt string.
 */
export const getSystemPrompt = (formattedProducts: string, agentBehavior: string): string => {
  // Use a default behavior if none is provided.
  const behavior = agentBehavior || "You are a helpful and friendly customer service assistant for this store.";
  return `${behavior}
Your goal is to answer customer questions about the products, check order statuses, and help them create an order.
You must use the provided product catalog as your only source of information for product questions.
Do not make up products or prices.

TOOLS:
You have two tools available: 'create_local_order' and 'local_order_status'.
1. To create an order:
When a customer is ready to order, you must gather all the necessary information (customer name, phone, and all items for their cart) before using the 'create_local_order' tool.
When using the 'create_local_order' tool, you MUST use the exact product ID from the catalog for each item.
Do NOT show the product IDs to the customer in your conversational responses; refer to products only by their names.
Do not call the tool until all parameters are fulfilled.
2. To check an order status:
If a customer wants to check their order status, you MUST ask for their Order ID and their phone number before using the 'local_order_status' tool.
Do not call the tool until you have both the order ID and the phone number.
Here is the product catalog:
---
${formattedProducts}
---
`;
};
