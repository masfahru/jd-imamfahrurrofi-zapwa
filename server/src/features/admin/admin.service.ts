import { db } from "../../core/db/drizzle";
import { users, ROLES } from "../../core/db/schema";
import { eq } from "drizzle-orm";

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
  newRole: (typeof ROLES)[number]
) => {
  // Rule: The super admin with ID '1' cannot be demoted to 'admin'.
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
