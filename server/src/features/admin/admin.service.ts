import { db } from "../../core/db/drizzle";
import { users, ROLES } from "../../core/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "better-auth";

export class AdminService {
  // Method to change a user's role
  async setUserRole(
    targetUserId: string,
    newRole: typeof ROLES[number],
  ) {
    // Rule: The super admin with ID '1' cannot be demoted.
    if (targetUserId === "1" && newRole === "admin") {
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
  }

  // Method to get all admins
  async getAdmins(): Promise<Partial<User>[]> {
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
  }
}
