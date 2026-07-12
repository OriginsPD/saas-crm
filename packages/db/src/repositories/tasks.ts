import { and, desc, eq, type SQL } from "drizzle-orm";

import {
	type AuthorizationScope,
	buildOwnerScopeFilter,
	canAccessOwnedRecord,
} from "../authorization/scope";
import { db } from "../index";
import { crmProfile, task } from "../schema/crm";
import { createTaskCompletedActivity } from "./activities";

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export const TASK_STATUSES = ["open", "completed"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskRecord = typeof task.$inferSelect;
export type TaskInsert = typeof task.$inferInsert;

export type TaskInput = {
	title: string;
	description?: string | null;
	assigneeProfileId: string;
	relatedCompanyId?: string | null;
	relatedContactId?: string | null;
	relatedDealId?: string | null;
	dueDate?: string | null;
	priority?: TaskPriority;
	status?: TaskStatus;
};

export type TaskValidationResult =
	| { valid: true; value: TaskInput }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

function parseDateOnly(value: string | null | undefined): string | null {
	if (!value?.trim()) {
		return null;
	}

	return value.trim();
}

export function validateTaskInput(input: TaskInput): TaskValidationResult {
	const fieldErrors: Record<string, string[]> = {};

	if (!input.title.trim()) {
		fieldErrors.title = ["Task title is required."];
	}

	if (!input.assigneeProfileId.trim()) {
		fieldErrors.assigneeProfileId = ["Assignee is required."];
	}

	if (input.priority && !TASK_PRIORITIES.includes(input.priority)) {
		fieldErrors.priority = ["Invalid task priority."];
	}

	if (input.status && !TASK_STATUSES.includes(input.status)) {
		fieldErrors.status = ["Invalid task status."];
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	return {
		valid: true,
		value: {
			...input,
			title: input.title.trim(),
			description: input.description?.trim() || null,
			assigneeProfileId: input.assigneeProfileId.trim(),
			relatedCompanyId: input.relatedCompanyId?.trim() || null,
			relatedContactId: input.relatedContactId?.trim() || null,
			relatedDealId: input.relatedDealId?.trim() || null,
			dueDate: parseDateOnly(input.dueDate),
			priority: input.priority ?? "medium",
			status: input.status ?? "open",
		},
	};
}

function taskScopeWhere(scope: AuthorizationScope): SQL | undefined {
	return buildOwnerScopeFilter(scope, task.assigneeProfileId);
}

export async function listTasks(
	scope: AuthorizationScope,
	options?: {
		status?: TaskStatus;
		assigneeProfileId?: string;
		relatedCompanyId?: string;
		relatedContactId?: string;
		relatedDealId?: string;
	},
): Promise<TaskRecord[]> {
	const scopeFilter = taskScopeWhere(scope);
	const filters: SQL[] = [];

	if (options?.status) {
		filters.push(eq(task.status, options.status));
	}

	if (options?.assigneeProfileId) {
		filters.push(eq(task.assigneeProfileId, options.assigneeProfileId));
	}

	if (options?.relatedCompanyId) {
		filters.push(eq(task.relatedCompanyId, options.relatedCompanyId));
	}

	if (options?.relatedContactId) {
		filters.push(eq(task.relatedContactId, options.relatedContactId));
	}

	if (options?.relatedDealId) {
		filters.push(eq(task.relatedDealId, options.relatedDealId));
	}

	if (scopeFilter) {
		filters.push(scopeFilter);
	}

	return db
		.select()
		.from(task)
		.where(filters.length > 0 ? and(...filters) : undefined)
		.orderBy(desc(task.dueDate), desc(task.updatedAt));
}

export async function getTaskById(
	scope: AuthorizationScope,
	taskId: string,
): Promise<TaskRecord | null> {
	const scopeFilter = taskScopeWhere(scope);
	const conditions = scopeFilter
		? and(eq(task.id, taskId), scopeFilter)
		: eq(task.id, taskId);

	const rows = await db.select().from(task).where(conditions).limit(1);

	return rows[0] ?? null;
}

export async function createTask(
	_scope: AuthorizationScope,
	input: TaskInput,
): Promise<TaskRecord | TaskValidationResult> {
	const validation = validateTaskInput(input);

	if (!validation.valid) {
		return validation;
	}

	const rows = await db
		.insert(task)
		.values({
			id: crypto.randomUUID(),
			title: validation.value.title,
			description: validation.value.description,
			assigneeProfileId: validation.value.assigneeProfileId,
			relatedCompanyId: validation.value.relatedCompanyId,
			relatedContactId: validation.value.relatedContactId,
			relatedDealId: validation.value.relatedDealId,
			dueDate: validation.value.dueDate,
			priority: validation.value.priority ?? "medium",
			status: validation.value.status ?? "open",
		})
		.returning();

	return rows[0] as TaskRecord;
}

export async function updateTask(
	scope: AuthorizationScope,
	taskId: string,
	input: Partial<TaskInput>,
): Promise<TaskRecord | TaskValidationResult | null> {
	const existing = await getTaskById(scope, taskId);

	if (!existing) {
		return null;
	}

	const merged: TaskInput = {
		title: input.title ?? existing.title,
		description:
			input.description !== undefined
				? input.description
				: existing.description,
		assigneeProfileId: input.assigneeProfileId ?? existing.assigneeProfileId,
		relatedCompanyId:
			input.relatedCompanyId !== undefined
				? input.relatedCompanyId
				: existing.relatedCompanyId,
		relatedContactId:
			input.relatedContactId !== undefined
				? input.relatedContactId
				: existing.relatedContactId,
		relatedDealId:
			input.relatedDealId !== undefined
				? input.relatedDealId
				: existing.relatedDealId,
		dueDate:
			input.dueDate !== undefined
				? input.dueDate
				: existing.dueDate
					? String(existing.dueDate)
					: null,
		priority: input.priority ?? existing.priority,
		status: input.status ?? existing.status,
	};

	const validation = validateTaskInput(merged);

	if (!validation.valid) {
		return validation;
	}

	const rows = await db
		.update(task)
		.set({
			title: validation.value.title,
			description: validation.value.description,
			assigneeProfileId: validation.value.assigneeProfileId,
			relatedCompanyId: validation.value.relatedCompanyId,
			relatedContactId: validation.value.relatedContactId,
			relatedDealId: validation.value.relatedDealId,
			dueDate: validation.value.dueDate,
			priority: validation.value.priority ?? existing.priority,
			status: validation.value.status ?? existing.status,
		})
		.where(eq(task.id, taskId))
		.returning();

	return rows[0] ?? null;
}

export async function completeTask(
	scope: AuthorizationScope,
	taskId: string,
	options?: { completedAt?: Date },
): Promise<TaskRecord | null> {
	const existing = await getTaskById(scope, taskId);

	if (!existing) {
		return null;
	}

	if (existing.status === "completed") {
		return existing;
	}

	const completedAt = options?.completedAt ?? new Date();
	const rows = await db
		.update(task)
		.set({
			status: "completed",
			completedAt,
		})
		.where(eq(task.id, taskId))
		.returning();

	const updated = rows[0] as TaskRecord;

	await createTaskCompletedActivity({
		actorProfileId: scope.actorProfileId,
		taskId: updated.id,
		taskTitle: updated.title,
		relatedCompanyId: updated.relatedCompanyId,
		relatedContactId: updated.relatedContactId,
		relatedDealId: updated.relatedDealId,
		occurredAt: completedAt,
	});

	return updated;
}

export async function reopenTask(
	scope: AuthorizationScope,
	taskId: string,
): Promise<TaskRecord | null> {
	const existing = await getTaskById(scope, taskId);

	if (!existing) {
		return null;
	}

	if (existing.status === "open") {
		return existing;
	}

	const rows = await db
		.update(task)
		.set({
			status: "open",
			completedAt: null,
		})
		.where(eq(task.id, taskId))
		.returning();

	return rows[0] ?? null;
}

export async function canAccessTask(
	scope: AuthorizationScope,
	taskId: string,
): Promise<boolean> {
	const rows = await db
		.select({
			assigneeProfileId: task.assigneeProfileId,
			assigneeTeamId: crmProfile.teamId,
		})
		.from(task)
		.innerJoin(crmProfile, eq(task.assigneeProfileId, crmProfile.id))
		.where(eq(task.id, taskId))
		.limit(1);

	const record = rows[0];

	if (!record) {
		return false;
	}

	return canAccessOwnedRecord(
		scope,
		record.assigneeProfileId,
		record.assigneeTeamId,
	);
}

export function buildTaskListQuery(
	scope: AuthorizationScope,
	options?: {
		status?: TaskStatus;
		assigneeProfileId?: string;
		relatedCompanyId?: string;
		relatedContactId?: string;
		relatedDealId?: string;
	},
) {
	const scopeFilter = taskScopeWhere(scope);
	const filters: SQL[] = [];

	if (options?.status) {
		filters.push(eq(task.status, options.status));
	}

	if (options?.assigneeProfileId) {
		filters.push(eq(task.assigneeProfileId, options.assigneeProfileId));
	}

	if (options?.relatedCompanyId) {
		filters.push(eq(task.relatedCompanyId, options.relatedCompanyId));
	}

	if (options?.relatedContactId) {
		filters.push(eq(task.relatedContactId, options.relatedContactId));
	}

	if (options?.relatedDealId) {
		filters.push(eq(task.relatedDealId, options.relatedDealId));
	}

	if (scopeFilter) {
		filters.push(scopeFilter);
	}

	return db
		.select()
		.from(task)
		.where(filters.length > 0 ? and(...filters) : undefined);
}
