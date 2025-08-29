import { db } from "@server/core/db/drizzle";
import { users } from "@server/core/db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

export const getMe = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    with: {
      license: {
        columns: {
          key: true,
        },
      },
    },
  });

  if (!user) {
    throw new HTTPException(404, { message: "User not found." });
  }

  // Flatten the response structure
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    licenseKey: user.license?.key || null,
  };
};
