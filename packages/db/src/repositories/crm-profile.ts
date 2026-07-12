import { eq } from "drizzle-orm";

import { db } from "../index";
import { crmProfile } from "../schema/crm";

export type CrmProfileRecord = typeof crmProfile.$inferSelect;

export async function getCrmProfileByUserId(
	userId: string,
): Promise<CrmProfileRecord | null> {
	const rows = await db
		.select()
		.from(crmProfile)
		.where(eq(crmProfile.userId, userId))
		.limit(1);

	return rows[0] ?? null;
}
