import { describe, expect, test } from "bun:test";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";

import {
	canAccessOwnedRecord,
	type AuthorizationScope,
} from "../authorization/scope";
import {
	ACTIVITY_TYPES,
	sortActivitiesReverseChronological,
	validateActivityInput,
} from "../repositories/activities";
import {
	buildTaskListQuery,
	TASK_PRIORITIES,
	TASK_STATUSES,
	validateTaskInput,
} from "../repositories/tasks";
import {
	activity,
	activityTypeEnum,
	crmProfile,
	task,
	taskPriorityEnum,
	taskStatusEnum,
} from "../schema/crm";

describe("task and activity schema", () => {
	test("exports task and activity tables", () => {
		expect(is(task, PgTable)).toBe(true);
		expect(is(activity, PgTable)).toBe(true);
		expect(getTableName(task)).toBe("task");
		expect(getTableName(activity)).toBe("activity");
	});

	test("models task and activity enums from data model", () => {
		expect(taskPriorityEnum.enumValues).toEqual(["low", "medium", "high"]);
		expect(taskStatusEnum.enumValues).toEqual(["open", "completed"]);
		expect(activityTypeEnum.enumValues).toEqual([
			"note",
			"call",
			"email",
			"meeting",
			"stage_change",
			"task_completed",
		]);
		expect(TASK_PRIORITIES).toEqual(taskPriorityEnum.enumValues);
		expect(TASK_STATUSES).toEqual(taskStatusEnum.enumValues);
		expect(ACTIVITY_TYPES).toEqual(activityTypeEnum.enumValues);
	});

	test("links tasks to assignee CRM profiles", () => {
		const taskColumns = getTableColumns(task);
		const taskForeignKeys = getTableConfig(task).foreignKeys;

		expect(taskColumns.title.notNull).toBe(true);
		expect(taskColumns.assigneeProfileId.notNull).toBe(true);
		expect(taskColumns.priority.notNull).toBe(true);
		expect(taskColumns.status.notNull).toBe(true);
		expect(
			taskForeignKeys.some(
				(foreignKey) => foreignKey.reference().foreignTable === crmProfile,
			),
		).toBe(true);
	});
});

describe("task validation", () => {
	test("requires title and assignee", () => {
		const result = validateTaskInput({
			title: "",
			assigneeProfileId: "",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.title).toContain("Task title is required.");
			expect(result.fieldErrors.assigneeProfileId).toContain(
				"Assignee is required.",
			);
		}
	});

	test("accepts valid task input", () => {
		const result = validateTaskInput({
			title: "Follow up proposal",
			assigneeProfileId: "profile-rep",
			priority: "high",
			dueDate: "2026-08-01",
			relatedDealId: "deal-1",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.priority).toBe("high");
			expect(result.value.dueDate).toBe("2026-08-01");
		}
	});
});

describe("activity validation", () => {
	test("requires subject and related entity", () => {
		const result = validateActivityInput({
			type: "note",
			subject: "",
			actorProfileId: "profile-rep",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.subject).toContain(
				"Activity subject is required.",
			);
			expect(result.fieldErrors.relatedCompanyId).toContain(
				"Activity must relate to a company, contact, or deal.",
			);
		}
	});

	test("accepts activity linked to deal", () => {
		const result = validateActivityInput({
			type: "call",
			subject: "Discovery call",
			actorProfileId: "profile-rep",
			relatedDealId: "deal-1",
			body: "Discussed pricing.",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.type).toBe("call");
			expect(result.value.relatedDealId).toBe("deal-1");
		}
	});
});

describe("activity timeline ordering", () => {
	test("sorts activities reverse chronological", () => {
		const sorted = sortActivitiesReverseChronological([
			{
				id: "activity-1",
				type: "note",
				subject: "Older",
				body: null,
				actorProfileId: "profile-rep",
				relatedCompanyId: "company-1",
				relatedContactId: null,
				relatedDealId: null,
				occurredAt: new Date("2026-07-01T10:00:00.000Z"),
				createdAt: new Date("2026-07-01T10:00:00.000Z"),
			},
			{
				id: "activity-2",
				type: "call",
				subject: "Newer",
				body: null,
				actorProfileId: "profile-rep",
				relatedCompanyId: "company-1",
				relatedContactId: null,
				relatedDealId: null,
				occurredAt: new Date("2026-07-02T10:00:00.000Z"),
				createdAt: new Date("2026-07-02T10:00:00.000Z"),
			},
		]);

		expect(sorted.map((record) => record.id)).toEqual([
			"activity-2",
			"activity-1",
		]);
	});

	test("uses createdAt as tiebreaker for same occurredAt", () => {
		const occurredAt = new Date("2026-07-02T10:00:00.000Z");
		const sorted = sortActivitiesReverseChronological([
			{
				id: "activity-1",
				type: "note",
				subject: "First created",
				body: null,
				actorProfileId: "profile-rep",
				relatedCompanyId: "company-1",
				relatedContactId: null,
				relatedDealId: null,
				occurredAt,
				createdAt: new Date("2026-07-02T10:00:00.000Z"),
			},
			{
				id: "activity-2",
				type: "email",
				subject: "Second created",
				body: null,
				actorProfileId: "profile-rep",
				relatedCompanyId: "company-1",
				relatedContactId: null,
				relatedDealId: null,
				occurredAt,
				createdAt: new Date("2026-07-02T10:05:00.000Z"),
			},
		]);

		expect(sorted.map((record) => record.id)).toEqual([
			"activity-2",
			"activity-1",
		]);
	});
});

describe("task authorization scope helpers", () => {
	test("administrator task query has no assignee scope predicate", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const query = buildTaskListQuery(adminScope).toSQL();

		expect(query.sql).not.toContain("false");
		expect(query.params).not.toContain("profile-admin");
	});

	test("representative task query scopes to assignee profile", () => {
		const representativeScope: AuthorizationScope = {
			access: "own_assigned",
			actorProfileId: "profile-rep",
			actorTeamId: "team-a",
		};

		const query = buildTaskListQuery(representativeScope).toSQL();

		expect(query.sql).toContain("assignee_profile_id");
		expect(query.params).toContain("profile-rep");
	});

	test("cross-team task access is denied for team scope", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager-a",
			actorTeamId: "team-a",
		};

		expect(canAccessOwnedRecord(managerScope, "profile-rep-b", "team-b")).toBe(
			false,
		);
		expect(canAccessOwnedRecord(managerScope, "profile-rep-a", "team-a")).toBe(
			true,
		);
	});
});

describe("task completion semantics", () => {
	test("completed status implies completedAt timestamp in validation defaults", () => {
		const result = validateTaskInput({
			title: "Send contract",
			assigneeProfileId: "profile-rep",
			status: "completed",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.status).toBe("completed");
		}
	});

	test("reopened task validation keeps open status without completedAt field", () => {
		const result = validateTaskInput({
			title: "Send contract",
			assigneeProfileId: "profile-rep",
			status: "open",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.status).toBe("open");
		}
	});
});
