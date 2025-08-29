import { db } from "@server/core/db/drizzle";
import { users, accounts, ROLES } from "@server/core/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@server/features/auth/auth.config";
import {randomUUIDv7} from "bun";

/**
 * Adds a new admin or super admin user to the database.
 * @param name The name of the new admin.
 * @param email The email of the new admin.
 * @param password The password for the new admin.
 * @param role The role to assign ('admin' or 'super admin').
 * @returns The newly created user object.
 * @throws Will throw an error if a user with the same email already exists.
 */
export const addAdmin = async (
  name: string,
  email: string,
  password: string,
  role: "admin" | "super admin",
) => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const authContext = await auth.$context;
  const passwordHasher = authContext.password;
  const generateId = authContext.generateId;

  if (typeof generateId !== "function" || !passwordHasher) {
    throw new Error("Auth context is not properly configured.");
  }

  const newUserId = generateId({ model: "user" }) || randomUUIDv7();
  const newAccountId = generateId({ model: "account" }) || randomUUIDv7();
  const hashedPassword = await passwordHasher.hash(password);

  const [newUser] = await db
    .transaction(async (tx) => {
      const insertedUser = await tx
        .insert(users)
        .values({
          id: newUserId,
          name,
          email,
          role,
          emailVerified: true, // Admins are verified by default
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          banned: users.banned, // <-- This is the fix
        });

      await tx.insert(accounts).values({
        id: newAccountId,
        userId: newUserId,
        providerId: "credential",
        accountId: email, // Using email as accountId for credentials
        password: hashedPassword,
      });

      return insertedUser;
    });

  if (!newUser) {
    throw new Error("Failed to create new admin user.");
  }

  return newUser;
};

/**
 * Updates the role of a specific user.
 * It prevents the primary super admin (ID '1') from being demoted.
 * @param targetUserId The ID of the user to update.
 * @param newRole The new role to assign to the user.
 * @returns The updated user object with id, email, and role.
 * @throws Will throw an error if the user is not found or if there's an attempt to demote the primary super admin.
 */
export const setUserRole = async (
  targetUserId: string,
  newRole: (typeof ROLES)[number],
) => {
  // Rule: The super admin with ID '1' cannot be demoted.
  if (targetUserId === "1" && newRole !== "super admin") {
    throw new Error("The primary super admin cannot be demoted.");
  }

  const [updatedUser] = await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  return updatedUser;
};

/**
 * Fetches all users with the 'admin' or 'super admin' role.
 * @returns A promise that resolves to an array of admin users.
 */
export const getAdmins = async () => {
  return db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      banned: true,
    },
    where: (users, { inArray }) =>
      inArray(users.role, ["admin", "super admin"]),
  });
};

/**
 * Fetches all users with role `user` from the database.
 * @returns A promise that resolves to an array of all users.
 */
export const getUsers = async () => {
  return db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      banned: true,
    },
    where: (users, { eq }) => eq(users.role, "user"),
  });
};
