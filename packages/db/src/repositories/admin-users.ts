import { eq } from "drizzle-orm";

import { db } from "../index";
import { user } from "../schema/auth";
import {
	crmProfile,
	crmRoleEnum,
	crmProfileStatusEnum,
	team,
} from "../schema/crm";

export const CRM_ROLES = crmRoleEnum.enumValues;
export type CrmRoleValue = (typeof CRM_ROLES)[number];
export type CrmProfileStatusValue =
	(typeof crmProfileStatusEnum.enumValues)[number];

export type AdminUserRecord = {
	userId: string;
	profileId: string;
	name: string;
	email: string;
	role: CrmRoleValue;
	teamId: string | null;
	teamName: string | null;
	status: CrmProfileStatusValue;
	createdAt: Date;
	updatedAt: Date;
};

export type AdminRoleUpdateInput = {
	role: CrmRoleValue;
	teamId?: string | null;
};

export type AdminRoleUpdateValidationResult =
	| { valid: true; value: AdminRoleUpdateInput }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

export type CreateCrmProfileInput = {
	userId: string;
	role: CrmRoleValue;
	teamId?: string | null;
};

export function validateAdminRoleUpdate(
	input: AdminRoleUpdateInput,
): AdminRoleUpdateValidationResult {
	const fieldErrors: Record<string, string[]> = {};

	if (!CRM_ROLES.includes(input.role)) {
		fieldErrors.role = ["Invalid CRM role."];
	}

	if (input.role !== "administrator" && !input.teamId?.trim()) {
		fieldErrors.teamId = ["Team is required for non-administrator roles."];
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	return {
		valid: true,
		value: {
			role: input.role,
			teamId:
				input.role === "administrator" ? null : input.teamId?.trim() || null,
		},
	};
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
	return db
		.select({
			userId: user.id,
			profileId: crmProfile.id,
			name: user.name,
			email: user.email,
			role: crmProfile.role,
			teamId: crmProfile.teamId,
			teamName: team.name,
			status: crmProfile.status,
			createdAt: crmProfile.createdAt,
			updatedAt: crmProfile.updatedAt,
		})
		.from(crmProfile)
		.innerJoin(user, eq(crmProfile.userId, user.id))
		.leftJoin(team, eq(crmProfile.teamId, team.id))
		.orderBy(user.name);
}

export async function listTeams(): Promise<
	Array<{ id: string; name: string }>
> {
	return db
		.select({
			id: team.id,
			name: team.name,
		})
		.from(team)
		.orderBy(team.name);
}

export async function getAdminUserByProfileId(
	profileId: string,
): Promise<AdminUserRecord | null> {
	const rows = await db
		.select({
			userId: user.id,
			profileId: crmProfile.id,
			name: user.name,
			email: user.email,
			role: crmProfile.role,
			teamId: crmProfile.teamId,
			teamName: team.name,
			status: crmProfile.status,
			createdAt: crmProfile.createdAt,
			updatedAt: crmProfile.updatedAt,
		})
		.from(crmProfile)
		.innerJoin(user, eq(crmProfile.userId, user.id))
		.leftJoin(team, eq(crmProfile.teamId, team.id))
		.where(eq(crmProfile.id, profileId))
		.limit(1);

	return rows[0] ?? null;
}

export async function updateAdminUserRole(
	profileId: string,
	input: AdminRoleUpdateInput,
): Promise<AdminUserRecord | AdminRoleUpdateValidationResult | null> {
	const validation = validateAdminRoleUpdate(input);

	if (!validation.valid) {
		return validation;
	}

	const rows = await db
		.update(crmProfile)
		.set({
			role: validation.value.role,
			teamId: validation.value.teamId,
		})
		.where(eq(crmProfile.id, profileId))
		.returning({ id: crmProfile.id });

	if (!rows[0]) {
		return null;
	}

	return getAdminUserByProfileId(profileId);
}

export async function updateAdminUserStatus(
	profileId: string,
	status: CrmProfileStatusValue,
): Promise<AdminUserRecord | null> {
	if (!crmProfileStatusEnum.enumValues.includes(status)) {
		return null;
	}

	const rows = await db
		.update(crmProfile)
		.set({ status })
		.where(eq(crmProfile.id, profileId))
		.returning({ id: crmProfile.id });

	if (!rows[0]) {
		return null;
	}

	return getAdminUserByProfileId(profileId);
}

export async function createCrmProfile(
	input: CreateCrmProfileInput,
): Promise<typeof crmProfile.$inferSelect> {
	const rows = await db
		.insert(crmProfile)
		.values({
			id: crypto.randomUUID(),
			userId: input.userId,
			role: input.role,
			teamId: input.role === "administrator" ? null : (input.teamId ?? null),
			status: "active",
		})
		.returning();

	return rows[0] as typeof crmProfile.$inferSelect;
}
