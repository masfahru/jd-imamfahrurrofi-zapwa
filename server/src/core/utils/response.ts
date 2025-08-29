import { z } from '@hono/zod-openapi';
import { type Context } from 'hono';

/**
 * Defines the Zod schema for a standardized error response.
 */
export const ErrorSchema = z.object({
  message: z.string().openapi({
    example: 'Resource not found.',
  }),
}).openapi('Error');

/**
 * Creates a standardized success response schema for non-paginated data.
 * It takes any Zod schema and wraps it in our standard { message, data } object.
 *
 * @param dataSchema The Zod schema for the 'data' field payload.
 * @returns A Zod object schema representing the final response structure.
 */
export const createSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string().openapi({
      example: 'Operation successful',
    }),
    data: dataSchema,
  });

/**
 * Defines the Zod schema for the pagination metadata object.
 * This is used in all paginated responses.
 */
export const PaginationSchema = z.object({
  totalItems: z.number().int().openapi({ example: 100 }),
  totalPages: z.number().int().openapi({ example: 10 }),
  currentPage: z.number().int().openapi({ example: 1 }),
  pageSize: z.number().int().openapi({ example: 10 }),
  hasNextPage: z.boolean().openapi({ example: true }),
  hasPrevPage: z.boolean().openapi({ example: false }),
}).openapi('Pagination');


/**
 * Creates a standardized success response schema for paginated data.
 * It combines the success response with a structured data payload containing items and pagination info.
 *
 * @param itemSchema The Zod schema for an individual item in the 'items' array.
 * @returns A Zod object schema representing the final paginated response structure.
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  createSuccessResponseSchema(
    z.object({
      items: z.array(itemSchema),
      pagination: PaginationSchema,
    }),
  );

/**
 * Formats and returns a standardized JSON success response.
 * @param c - The Hono context object.
 * @param message - The success message for the response.
 * @param data - The data payload.
 * @param statusCode - The HTTP status code (defaults to 200).
 */
export const jsonResponse = (
  c: Context,
  message: string,
  data: unknown,
  statusCode: number = 200,
) => {
  return c.json(
    {
      message,
      data,
    },
    statusCode as any,
  );
};
