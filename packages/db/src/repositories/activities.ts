import { and, desc, eq, type SQL } from "drizzle-orm";

import {
	type AuthorizationScope,
	buildOwnerScopeFilter,
	canAccessOwnedRecord,
} from "../authorization/scope";
import { db } from "../index";
import { activity, crmProfile } from "../schema/crm";
import type { DealStage } from "./deals";

export const ACTIVITY_TYPES = [
	"note",
	"call",
	"email",
	"meeting",
	"stage_change",
	"task_completed",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityRecord = typeof activity.$inferSelect;

export type ActivityInput = {
	type: ActivityType;
	subject: string;
	body?: string | null;
	actorProfileId: string;
	relatedCompanyId?: string | null;
	relatedContactId?: string | null;
	relatedDealId?: string | null;
	occurredAt?: Date;
};

export type ActivityValidationResult =
	| { valid: true; value: ActivityInput }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

export type StageChangeActivityInput = {
	actorProfileId: string;
	dealId: string;
	companyId: string;
	fromStage: DealStage;
	toStage: DealStage;
};

export type TaskCompletedActivityInput = {
	actorProfileId: string;
	taskId: string;
	taskTitle: string;
	relatedCompanyId?: string | null;
	relatedContactId?: string | null;
	relatedDealId?: string | null;
	occurredAt?: Date;
};

export function validateActivityInput(
	input: ActivityInput,
): ActivityValidationResult {
	const fieldErrors: Record<string, string[]> = {};

	if (!input.subject.trim()) {
		fieldErrors.subject = ["Activity subject is required."];
	}

	if (!input.actorProfileId.trim()) {
		fieldErrors.actorProfileId = ["Actor is required."];
	}

	if (!ACTIVITY_TYPES.includes(input.type)) {
		fieldErrors.type = ["Invalid activity type."];
	}

	const relatedCompanyId = input.relatedCompanyId?.trim() || null;
	const relatedContactId = input.relatedContactId?.trim() || null;
	const relatedDealId = input.relatedDealId?.trim() || null;

	if (!relatedCompanyId && !relatedContactId && !relatedDealId) {
		fieldErrors.relatedCompanyId = [
			"Activity must relate to a company, contact, or deal.",
		];
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	return {
		valid: true,
		value: {
			...input,
			subject: input.subject.trim(),
			body: input.body?.trim() || null,
			actorProfileId: input.actorProfileId.trim(),
			relatedCompanyId,
			relatedContactId,
			relatedDealId,
		},
	};
}

function activityScopeWhere(scope: AuthorizationScope): SQL | undefined {
	return buildOwnerScopeFilter(scope, activity.actorProfileId);
}

export async function listActivities(
	scope: AuthorizationScope,
	options?: {
		relatedCompanyId?: string;
		relatedContactId?: string;
		relatedDealId?: string;
		type?: ActivityType;
	},
): Promise<ActivityRecord[]> {
	const scopeFilter = activityScopeWhere(scope);
	const filters: SQL[] = [];

	if (options?.relatedCompanyId) {
		filters.push(eq(activity.relatedCompanyId, options.relatedCompanyId));
	}

	if (options?.relatedContactId) {
		filters.push(eq(activity.relatedContactId, options.relatedContactId));
	}

	if (options?.relatedDealId) {
		filters.push(eq(activity.relatedDealId, options.relatedDealId));
	}

	if (options?.type) {
		filters.push(eq(activity.type, options.type));
	}

	if (scopeFilter) {
		filters.push(scopeFilter);
	}

	return db
		.select()
		.from(activity)
		.where(filters.length > 0 ? and(...filters) : undefined)
		.orderBy(desc(activity.occurredAt), desc(activity.createdAt));
}

export async function createActivity(
	input: ActivityInput,
): Promise<ActivityRecord | ActivityValidationResult> {
	const validation = validateActivityInput(input);

	if (!validation.valid) {
		return validation;
	}

	const rows = await db
		.insert(activity)
		.values({
			id: crypto.randomUUID(),
			type: validation.value.type,
			subject: validation.value.subject,
			body: validation.value.body,
			actorProfileId: validation.value.actorProfileId,
			relatedCompanyId: validation.value.relatedCompanyId,
			relatedContactId: validation.value.relatedContactId,
			relatedDealId: validation.value.relatedDealId,
			occurredAt: validation.value.occurredAt ?? new Date(),
		})
		.returning();

	return rows[0] as ActivityRecord;
}

export async function createStageChangeActivity(
	input: StageChangeActivityInput,
): Promise<ActivityRecord> {
	const rows = await db
		.insert(activity)
		.values({
			id: crypto.randomUUID(),
			type: "stage_change",
			subject: `Deal moved to ${input.toStage.replace("_", " ")}`,
			body: `Stage changed from ${input.fromStage} to ${input.toStage}.`,
			actorProfileId: input.actorProfileId,
			relatedCompanyId: input.companyId,
			relatedDealId: input.dealId,
		})
		.returning();

	return rows[0] as ActivityRecord;
}

export async function createTaskCompletedActivity(
	input: TaskCompletedActivityInput,
): Promise<ActivityRecord | ActivityValidationResult> {
	return createActivity({
		type: "task_completed",
		subject: `Task completed: ${input.taskTitle}`,
		body: `Task ${input.taskId} marked complete.`,
		actorProfileId: input.actorProfileId,
		relatedCompanyId: input.relatedCompanyId,
		relatedContactId: input.relatedContactId,
		relatedDealId: input.relatedDealId,
		occurredAt: input.occurredAt,
	});
}

export async function canAccessActivity(
	scope: AuthorizationScope,
	activityId: string,
): Promise<boolean> {
	const rows = await db
		.select({
			actorProfileId: activity.actorProfileId,
			actorTeamId: crmProfile.teamId,
		})
		.from(activity)
		.innerJoin(crmProfile, eq(activity.actorProfileId, crmProfile.id))
		.where(eq(activity.id, activityId))
		.limit(1);

	const record = rows[0];

	if (!record) {
		return false;
	}

	return canAccessOwnedRecord(scope, record.actorProfileId, record.actorTeamId);
}

export function buildActivityListQuery(
	scope: AuthorizationScope,
	options?: {
		relatedCompanyId?: string;
		relatedContactId?: string;
		relatedDealId?: string;
		type?: ActivityType;
	},
) {
	const scopeFilter = activityScopeWhere(scope);
	const filters: SQL[] = [];

	if (options?.relatedCompanyId) {
		filters.push(eq(activity.relatedCompanyId, options.relatedCompanyId));
	}

	if (options?.relatedContactId) {
		filters.push(eq(activity.relatedContactId, options.relatedContactId));
	}

	if (options?.relatedDealId) {
		filters.push(eq(activity.relatedDealId, options.relatedDealId));
	}

	if (options?.type) {
		filters.push(eq(activity.type, options.type));
	}

	if (scopeFilter) {
		filters.push(scopeFilter);
	}

	return db
		.select()
		.from(activity)
		.where(filters.length > 0 ? and(...filters) : undefined);
}

export function sortActivitiesReverseChronological(
	records: ActivityRecord[],
): ActivityRecord[] {
	return [...records].sort((left, right) => {
		const occurredDiff = right.occurredAt.getTime() - left.occurredAt.getTime();

		if (occurredDiff !== 0) {
			return occurredDiff;
		}

		return right.createdAt.getTime() - left.createdAt.getTime();
	});
}
