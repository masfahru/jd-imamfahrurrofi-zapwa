import { z } from "@hono/zod-openapi";
import { createSuccessResponseSchema } from "@server/core/utils/response";
import { ROLES } from "@server/core/db/schema";

// Schema for the signup request body
export const UserSignupBodySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Schema for the successful signup response
export const UserSignupResponseSchema = createSuccessResponseSchema(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
);

// Schema for the 'me' endpoint response
export const MeResponseSchema = createSuccessResponseSchema(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(ROLES),
    licenseKey: z.string().nullable(),
  }),
);
