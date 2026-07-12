import { eq } from "drizzle-orm";

import { db } from "../index";
import { user } from "../schema/auth";
import { DEMO_ACCOUNTS } from "./fixtures";
import { seedCrmDatabase } from "./seed-crm-database";

async function main() {
	const { auth } = await import("@portfolio-saas-crm/auth");

	const result = await seedCrmDatabase({
		findUserIdByEmail: async (email) => {
			const rows = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.email, email))
				.limit(1);

			return rows[0]?.id ?? null;
		},
		createAuthUser: async (input) => {
			const signup = await auth.api.signUpEmail({
				body: {
					name: input.name,
					email: input.email,
					password: input.password,
				},
			});

			if (!signup.user?.id) {
				throw new Error(`Unable to create auth user for ${input.email}`);
			}

			return { userId: signup.user.id, created: true };
		},
	});

	if (result.skipped) {
		console.log("Seed already applied. Skipping.");
		return;
	}

	console.log("CRM demo seed complete.");
	console.log(`  teams: ${result.summary.teams}`);
	console.log(`  users: ${result.summary.accounts}`);
	console.log(`  companies: ${result.summary.companies}`);
	console.log(`  contacts: ${result.summary.contacts}`);
	console.log(`  deals: ${result.summary.deals}`);
	console.log(`  tasks: ${result.summary.tasks}`);
	console.log(`  activities: ${result.summary.activities}`);
	console.log("");
	console.log("Demo accounts (local only):");
	for (const account of DEMO_ACCOUNTS) {
		console.log(`  ${account.role}: ${account.email} / ${account.password}`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
