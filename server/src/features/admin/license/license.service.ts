import { db } from "@server/core/db/drizzle";
import { licenses, users } from "@server/core/db/schema";
import { and, count, eq, isNull, ne } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { auth } from "@server/features/auth/auth.config";
import { randomBytes } from "crypto";
import {randomUUIDv7} from "bun";

/**
 * Generates a cryptographically secure random alphanumeric string.
 * @param length The desired length of the string.
 * @returns A random alphanumeric string.
 */
export const generateRandomString = (length: number): string => {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Creates and assigns a new license to a user.
 * @param userId The ID of the user to assign the license to.
 * @returns The newly created license object.
 * @throws HTTPException if the user already has a license or cannot be found.
 */
export const createAndAssignLicense = async (userId: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) {
    throw new HTTPException(404, { message: "User not found." });
  }

  const existingLicense = await db.query.licenses.findFirst({ where: eq(licenses.userId, userId) });
  if (existingLicense) {
    throw new HTTPException(400, { message: "User already has a license." });
  }

  const authContext = await auth.$context;
  const generateId = authContext.generateId;
  if (typeof generateId !== "function") {
    throw new HTTPException(500, { message: "Auth context is not properly configured." });
  }

  // Generate a unique 8-character key
  let newKey: string;
  let keyExists = true;
  do {
    newKey = generateRandomString(8);
    const existingKey = await db.query.licenses.findFirst({ where: eq(licenses.key, newKey) });
    keyExists = !!existingKey;
  } while (keyExists);


  const newLicenseId = generateId({ model: "license" }) || randomUUIDv7();
  const [newLicense] = await db
    .insert(licenses)
    .values({
      id: newLicenseId,
      key: newKey,
      userId: userId,
    })
    .returning();

  if (!newLicense) {
    throw new HTTPException(500, { message: "Failed to create license." });
  }

  return newLicense;
};

/**
 * Removes (unassigns) a license from a user. The license key remains in the system.
 * @param userId The ID of the user whose license will be removed.
 * @returns An object indicating success.
 * @throws HTTPException if the user or their license is not found.
 */
export const removeLicenseFromUser = async (userId: string) => {
  const [updatedLicense] = await db
    .update(licenses)
    .set({ userId: null, updatedAt: new Date() })
    .where(eq(licenses.userId, userId))
    .returning({ id: licenses.id });

  if (!updatedLicense) {
    throw new HTTPException(404, { message: "No license found for this user." });
  }

  return { success: true, message: "License removed from user." };
};

/**
 * Reassigns an existing license to a different user.
 * @param licenseId The ID of the license to reassign.
 * @param newUserId The ID of the new user to assign the license to.
 * @returns The updated license object.
 * @throws HTTPException for various validation errors.
 */
export const reassignLicense = async (licenseId: string, newUserId: string) => {
  const license = await db.query.licenses.findFirst({ where: eq(licenses.id, licenseId) });
  if (!license) {
    throw new HTTPException(404, { message: "License not found." });
  }

  const newUser = await db.query.users.findFirst({ where: eq(users.id, newUserId) });
  if (!newUser) {
    throw new HTTPException(404, { message: "New user not found." });
  }

  const userAlreadyHasLicense = await db.query.licenses.findFirst({
    where: and(eq(licenses.userId, newUserId), ne(licenses.id, licenseId)),
  });
  if (userAlreadyHasLicense) {
    throw new HTTPException(400, { message: "The new user already has a different license." });
  }

  const [updatedLicense] = await db
    .update(licenses)
    .set({ userId: newUserId, updatedAt: new Date() })
    .where(eq(licenses.id, licenseId))
    .returning();

  return updatedLicense;
};

/**
 * Fetches a paginated list of all licenses, including assigned user info.
 * @param page The current page number.
 * @param limit The number of items per page.
 * @returns A paginated list of licenses.
 */
export const getLicenses = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const totalItemsResult = await db.select({ value: count() }).from(licenses);
  const totalItems = totalItemsResult[0]?.value || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const licenseList = await db.query.licenses.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    offset,
    limit,
  });

  return {
    items: licenseList,
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
