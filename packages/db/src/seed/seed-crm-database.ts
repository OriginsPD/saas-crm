import { eq } from "drizzle-orm";

import { db } from "../index";
import {
	activity,
	company,
	contact,
	crmProfile,
	deal,
	dealContact,
	task,
	team,
} from "../schema/crm";
import {
	DEMO_ACCOUNTS,
	DEMO_ACTIVITIES,
	DEMO_COMPANIES,
	DEMO_CONTACTS,
	DEMO_DEALS,
	DEMO_TASKS,
	DEMO_TEAM,
	type DemoAccountKey,
	getSeedSummary,
} from "./fixtures";

export type SeedAuthUserInput = {
	name: string;
	email: string;
	password: string;
};

export type SeedAuthUserResult = {
	userId: string;
	created: boolean;
};

export type SeedCrmDatabaseDeps = {
	createAuthUser: (input: SeedAuthUserInput) => Promise<SeedAuthUserResult>;
	findUserIdByEmail: (email: string) => Promise<string | null>;
};

export type SeedCrmDatabaseResult = {
	skipped: boolean;
	profileIds: Record<DemoAccountKey, string>;
	summary: ReturnType<typeof import("./fixtures").getSeedSummary>;
};

export async function isSeedDatabaseApplied(): Promise<boolean> {
	const rows = await db
		.select({ id: team.id })
		.from(team)
		.where(eq(team.id, DEMO_TEAM.id))
		.limit(1);

	return rows.length > 0;
}

export async function seedCrmDatabase(
	deps: SeedCrmDatabaseDeps,
): Promise<SeedCrmDatabaseResult> {
	if (await isSeedDatabaseApplied()) {
		return {
			skipped: true,
			profileIds: {} as Record<DemoAccountKey, string>,
			summary: getSeedSummary(),
		};
	}

	const profileIds = {} as Record<DemoAccountKey, string>;

	await db.insert(team).values({
		id: DEMO_TEAM.id,
		name: DEMO_TEAM.name,
	});

	for (const account of DEMO_ACCOUNTS) {
		let userId = await deps.findUserIdByEmail(account.email);

		if (!userId) {
			const authResult = await deps.createAuthUser({
				name: account.name,
				email: account.email,
				password: account.password,
			});
			userId = authResult.userId;
		}

		const existingProfile = await db
			.select({ id: crmProfile.id })
			.from(crmProfile)
			.where(eq(crmProfile.userId, userId))
			.limit(1);

		if (existingProfile[0]) {
			profileIds[account.key] = existingProfile[0].id;
			continue;
		}

		const profileRows = await db
			.insert(crmProfile)
			.values({
				id: crypto.randomUUID(),
				userId,
				role: account.role,
				teamId: account.teamId,
				status: "active",
			})
			.returning({ id: crmProfile.id });

		profileIds[account.key] = profileRows[0]?.id as string;
	}

	await db
		.update(team)
		.set({ managerProfileId: profileIds.manager })
		.where(eq(team.id, DEMO_TEAM.id));

	for (const companySeed of DEMO_COMPANIES) {
		await db.insert(company).values({
			id: companySeed.id,
			name: companySeed.name,
			domain: companySeed.domain,
			industry: companySeed.industry,
			size: companySeed.size,
			status: companySeed.status,
			ownerProfileId: profileIds[companySeed.ownerKey],
			notes: companySeed.notes,
		});
	}

	for (const contactSeed of DEMO_CONTACTS) {
		await db.insert(contact).values({
			id: contactSeed.id,
			companyId: contactSeed.companyId,
			firstName: contactSeed.firstName,
			lastName: contactSeed.lastName,
			title: contactSeed.title,
			email: contactSeed.email,
			phone: contactSeed.phone,
			status: "active",
			ownerProfileId: profileIds[contactSeed.ownerKey],
		});
	}

	for (const dealSeed of DEMO_DEALS) {
		await db.insert(deal).values({
			id: dealSeed.id,
			companyId: dealSeed.companyId,
			ownerProfileId: profileIds[dealSeed.ownerKey],
			title: dealSeed.title,
			valueCents: dealSeed.valueCents,
			currency: "USD",
			stage: dealSeed.stage,
			probability: dealSeed.probability,
			expectedCloseDate: dealSeed.expectedCloseDate,
			closedAt: "closedAt" in dealSeed ? new Date(dealSeed.closedAt) : null,
		});

		for (const contactId of dealSeed.contactIds) {
			await db.insert(dealContact).values({
				dealId: dealSeed.id,
				contactId,
				role: "primary",
			});
		}
	}

	for (const taskSeed of DEMO_TASKS) {
		await db.insert(task).values({
			id: taskSeed.id,
			title: taskSeed.title,
			description: "description" in taskSeed ? taskSeed.description : null,
			assigneeProfileId: profileIds[taskSeed.assigneeKey],
			relatedCompanyId: taskSeed.relatedCompanyId ?? null,
			relatedContactId: taskSeed.relatedContactId ?? null,
			relatedDealId:
				"relatedDealId" in taskSeed ? taskSeed.relatedDealId : null,
			dueDate: taskSeed.dueDate,
			priority: taskSeed.priority,
			status: taskSeed.status,
			completedAt:
				"completedAt" in taskSeed ? new Date(taskSeed.completedAt) : null,
		});
	}

	for (const activitySeed of DEMO_ACTIVITIES) {
		await db.insert(activity).values({
			id: activitySeed.id,
			type: activitySeed.type,
			subject: activitySeed.subject,
			body: "body" in activitySeed ? activitySeed.body : null,
			actorProfileId: profileIds[activitySeed.actorKey],
			relatedCompanyId: activitySeed.relatedCompanyId ?? null,
			relatedContactId:
				"relatedContactId" in activitySeed
					? activitySeed.relatedContactId
					: null,
			relatedDealId: activitySeed.relatedDealId ?? null,
			occurredAt: new Date(activitySeed.occurredAt),
		});
	}

	return {
		skipped: false,
		profileIds,
		summary: getSeedSummary(),
	};
}
