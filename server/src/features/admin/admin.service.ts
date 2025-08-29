import { db } from "@server/core/db/drizzle";
import { users, accounts, ROLES } from "@server/core/db/schema";
import { and, count, eq, inArray, ne } from "drizzle-orm";
import { auth } from "@server/features/auth/auth.config";
import { randomUUIDv7 } from "bun";
import { HTTPException } from "hono/http-exception";

/**
 * Adds a new admin or super admin user to the database.
 * @param name The name of the new admin.
 * @param email The email of the new admin.
 * @param password The password for the new admin.
 * @param role The role to assign ('admin' or 'super admin').
 * @returns The newly created user object.
 * @throws Will throw an HTTPException if the user already exists or configuration is missing.
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
    throw new HTTPException(400, { message: "User with this email already exists." });
  }

  const authContext = await auth.$context;
  const passwordHasher = authContext.password;
  const generateId = authContext.generateId;
  if (typeof generateId !== "function" || !passwordHasher) {
    throw new HTTPException(500, { message: "Auth context is not properly configured." });
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
          banned: users.banned,
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
    throw new HTTPException(500, { message: "Failed to create new admin user." });
  }

  return newUser;
};

/**
 * Updates the role of a specific user.
 * It prevents the primary super admin (ID '1') from being demoted.
 * @param targetUserId The ID of the user to update.
 * @param newRole The new role to assign to the user.
 * @returns The updated user object with id, email, and role.
 * @throws Will throw an HTTPException if the user is not found or if there's an attempt to demote the primary super admin.
 */
export const setUserRole = async (
  targetUserId: string,
  newRole: (typeof ROLES)[number],
) => {
  // Rule: The super admin with ID '1' cannot be demoted.
  if (targetUserId === "1" && newRole !== "super admin") {
    throw new HTTPException(400, { message: "The primary super admin cannot be demoted." });
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
    throw new HTTPException(404, { message: "User not found." });
  }

  return updatedUser;
};

/**
 * Fetches a paginated list of users with 'admin' or 'super admin' roles.
 * @param page - The current page number (1-based).
 * @param limit - The number of items per page.
 * @returns A promise that resolves to a paginated response object.
 */
export const getAdmins = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const whereClause = inArray(users.role, ["admin", "super admin"]);

  // Get total count of admins
  const totalItemsResult = await db.select({ value: count() }).from(users).where(whereClause);
  const totalItems = totalItemsResult[0] ? totalItemsResult[0].value: 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Get the admins for the current page
  const adminUsers = await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      banned: true,
    },
    where: whereClause,
    offset,
    limit,
  });
  return {
    items: adminUsers,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Fetches a paginated list of users with the 'user' role from the database.
 * @param page - The current page number (1-based).
 * @param limit - The number of items per page.
 * @returns A promise that resolves to a paginated response object.
 */
export const getUsers = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const whereClause = eq(users.role, "user");

  // Get total count of users
  const totalItemsResult = await db.select({ value: count() }).from(users).where(whereClause);
  const totalItems = totalItemsResult[0] ? totalItemsResult[0].value : 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Get the users for the current page
  const userList = await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      banned: true,
    },
    where: whereClause,
    offset,
    limit,
  });
  return {
    items: userList,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Updates an admin's name and email.
 * @param adminId The ID of the admin to update.
 * @param name The new name for the admin.
 * @param email The new email for the admin.
 * @returns The updated user object.
 * @throws Will throw an HTTPException if the user is not found or the email is already taken.
 */
export const updateAdmin = async (adminId: string, name: string, email: string) => {
  // Check if the new email is already taken by another user
  const existingUserWithEmail = await db.query.users.findFirst({
    where: and(eq(users.email, email), ne(users.id, adminId)),
  });
  if (existingUserWithEmail) {
    throw new HTTPException(400, { message: 'Email is already in use by another account.' });
  }

  const [updatedAdmin] = await db
    .update(users)
    .set({ name, email, updatedAt: new Date() })
    .where(eq(users.id, adminId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      banned: users.banned,
    });
  if (!updatedAdmin) {
    throw new HTTPException(404, { message: 'Admin not found.' });
  }

  return updatedAdmin;
};

/**
 * Deletes an admin user from the database.
 * @param adminId The ID of the admin to delete.
 * @returns An object containing the ID of the deleted admin.
 * @throws Will throw an HTTPException if trying to delete the primary super admin or if the admin is not found.
 */
export const deleteAdmin = async (adminId: string) => {
  // Prevent the primary super admin from being deleted
  if (adminId === '1') {
    throw new HTTPException(400, { message: 'The primary super admin cannot be deleted.' });
  }

  const [deletedUser] = await db.delete(users).where(eq(users.id, adminId)).returning({ id: users.id });
  if (!deletedUser) {
    throw new HTTPException(404, { message: 'Admin not found.' });
  }

  return { id: deletedUser.id };
};

/**
 * Changes the password for a given admin user.
 * A super admin can change their own password or any 'admin' user's password.
 * They cannot change another super admin's password.
 * @param targetAdminId The ID of the admin whose password is to be changed.
 * @param newPassword The new password.
 * @param currentUserId The ID of the user performing the action.
 * @returns An object indicating success.
 * @throws Will throw an HTTPException for various error conditions.
 */
export const changeAdminPassword = async (
  targetAdminId: string,
  newPassword: string,
  currentUserId: string,
) => {
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetAdminId),
  });

  if (!targetUser) {
    throw new HTTPException(404, { message: 'User not found.' });
  }

  // Security check: super admin can't change another super admin's password
  if (targetUser.role === 'super admin' && targetAdminId !== currentUserId) {
    throw new HTTPException(403, {
      message: "Forbidden: Super admins can only change their own password.",
    });
  }

  // Ensure the target is actually an admin or super admin
  if (targetUser.role !== 'admin' && targetUser.role !== 'super admin') {
    throw new HTTPException(400, { message: 'Target user is not an admin.' });
  }

  const authContext = await auth.$context;
  const passwordHasher = authContext.password;

  if (!passwordHasher) {
    throw new HTTPException(500, { message: 'Password hasher is not configured.' });
  }

  const hashedPassword = await passwordHasher.hash(newPassword);

  await db
    .update(accounts)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(
      and(
        eq(accounts.userId, targetAdminId),
        eq(accounts.providerId, 'credential'),
      ),
    );

  return { success: true };
};
