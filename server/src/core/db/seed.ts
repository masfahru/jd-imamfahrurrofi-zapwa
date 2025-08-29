import { db } from "./drizzle";
import { users, accounts } from "./schema";
import { auth } from "../../features/auth/auth.config";
import {randomUUIDv7} from "bun";

async function main() {
  console.log("🌱 Seeding database...");

  try {
    const authContext = await auth.$context;
    const passwordHasher = authContext.password;
    const generateId = authContext.generateId;

    if (typeof generateId !== "function" || !passwordHasher) {
      throw new Error(
        "ID generator function or password hasher is not available in auth context.",
      );
    }

    const superAdminEmail = "super@admin.com";
    const superAdminPassword = "superadmin";
    const superAdminId = "1";

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, superAdminId),
    });

    if (existingUser) {
      console.log(
        `Super Admin user with ID '${superAdminId}' already exists. Skipping user creation.`,
      );
    } else {
      await db.insert(users).values({
        id: superAdminId,
        name: "Super Admin",
        email: superAdminEmail,
        emailVerified: true,
        role: "super admin",
      });
      console.log(`Super Admin user with ID '${superAdminId}' created.`);
    }

    const existingAccount = await db.query.accounts.findFirst({
      where: (accounts, { and, eq }) =>
        and(
          eq(accounts.userId, superAdminId),
          eq(accounts.providerId, "credential"),
        ),
    });

    if (existingAccount) {
      console.log(
        `Credential account for Super Admin already exists. Skipping account creation.`,
      );
    } else {
      const newAccountId = generateId({ model: "account" });
      const hashedPassword = await passwordHasher.hash(superAdminPassword);

      await db.insert(accounts).values({
        id: newAccountId || randomUUIDv7(),
        userId: superAdminId,
        providerId: "credential",
        accountId: superAdminId,
        password: hashedPassword,
      });
      console.log(`Credential account for Super Admin created.`);
    }

    console.log("✅ Seeding complete.");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await db.$client.end();
    console.log("🔌 Database connection closed.");
  }
}

main();
