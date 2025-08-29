import { db } from "@server/core/db/drizzle";
import { users, accounts, licenses } from "@server/core/db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { auth } from "@server/features/auth/auth.config";
import { randomUUIDv7 } from "bun";
import { generateRandomString } from "@server/features/admin/license/license.service";

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
    licenseKey: user.license?.key ||
      null,
  };
};

export const signUpUserAndAssignLicense = async (
  name: string,
  email: string,
  password: string,
) => {
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingUser) {
    throw new HTTPException(400, {
      message: "User with this email already exists.",
    });
  }

  // Get auth context for hashing and ID generation
  const authContext = await auth.$context;
  const passwordHasher = authContext.password;
  const generateId = authContext.generateId;
  if (typeof generateId !== "function" || !passwordHasher) {
    throw new HTTPException(500, {
      message: "Auth context is not properly configured.",
    });
  }

  const newUserId = generateId({ model: "user" }) || randomUUIDv7();
  const newAccountId = generateId({ model: "account" }) || randomUUIDv7();
  const newLicenseId = generateId({ model: "license" }) || randomUUIDv7();
  const hashedPassword = await passwordHasher.hash(password);

  // Generate a unique 8-character license key
  let newKey: string;
  let keyExists = true;
  do {
    newKey = generateRandomString(8);
    const existingKey = await db.query.licenses.findFirst({
      where: eq(licenses.key, newKey),
    });
    keyExists = !!existingKey;
  } while (keyExists);

  // Use a transaction to create user, account, and license atomically
  const [newUser] = await db.transaction(async (tx) => {
    const insertedUser = await tx
      .insert(users)
      .values({
        id: newUserId,
        name,
        email,
        role: "user",
        emailVerified: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    await tx.insert(accounts).values({
      id: newAccountId,
      userId: newUserId,
      providerId: "credential",
      accountId: email,
      password: hashedPassword,
    });

    await tx.insert(licenses).values({
      id: newLicenseId,
      key: newKey,
      userId: newUserId,
    });

    return insertedUser;
  });

  if (!newUser) {
    throw new HTTPException(500, { message: "Failed to create new user." });
  }

  return newUser;
};
