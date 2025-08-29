import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@server/core/db/drizzle";
import { openAPI } from "better-auth/plugins";
import * as schema from "@server/core/db/schema";
import { allowedOrigins } from "@server/core/config/origins";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: allowedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin({
      // Only allow 'super admin' to access plugin's built-in admin routes
      adminRoles: ["super admin"],
    }),
    openAPI(),
  ],
});
