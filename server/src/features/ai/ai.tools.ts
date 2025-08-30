import { z } from "zod";
import { tool } from '@langchain/core/tools';
import { createOrder as createOrderService } from "@server/features/order/order.service";
import type { Product } from "@server/core/db/schema";

// Updated Zod schema for the tool's arguments.
// The cart now expects `productId` instead of `name` and `price`.
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

      // Validate that all product IDs exist in the catalog.
      // This is much more reliable than matching by name.
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

      // Type assertion is safe now because we've checked for strings.
      const validItems = itemsWithIds as { productId: string; quantity: number }[];

      await createOrderService(licenseId, {
        items: validItems,
        customer
      });

      return `Order created successfully for ${customer.name}. Thank them and confirm the order has been placed.`;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during tool execution.";
      return `Failed to execute tool. Reason: ${errorMessage}`;
    }
  };

  return tool(executeCreateOrder, {
    name: "create_local_order",
    description: "Creates a new order in the system with the customer's details and cart items. Only use this tool when all required information has been gathered from the user.",
    schema: createLocalOrderToolSchema,
  });
};
