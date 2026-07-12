import type {
	AuthorizationScope,
	TaskInput,
	TaskRecord,
	TaskStatus,
	TaskValidationResult,
} from "@portfolio-saas-crm/db";
import {
	completeTask,
	createTask,
	getTaskById,
	listTasks,
	reopenTask,
	updateTask,
} from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { buildAuthorizationScope } from "../authz/scope";
import type { CrmProfileRecord } from "../authz/profile";
import { notFoundError, validationError } from "../shared/errors";

export type TasksRouteDeps = {
	listTasks: typeof listTasks;
	getTaskById: typeof getTaskById;
	createTask: typeof createTask;
	updateTask: typeof updateTask;
	completeTask: typeof completeTask;
	reopenTask: typeof reopenTask;
	buildScope: (
		profile: CrmProfileRecord,
		resource: "tasks",
	) => AuthorizationScope;
};

const defaultDeps: TasksRouteDeps = {
	listTasks,
	getTaskById,
	createTask,
	updateTask,
	completeTask,
	reopenTask,
	buildScope: buildAuthorizationScope,
};

function taskScope(profile: CrmProfileRecord, deps: TasksRouteDeps) {
	return deps.buildScope(profile, "tasks");
}

function handleTaskMutationResult(
	result: TaskRecord | TaskValidationResult,
): TaskRecord {
	if ("valid" in result && !result.valid) {
		validationError("Invalid task input.", result.fieldErrors);
	}

	return result as TaskRecord;
}

function parseTaskStatus(value: unknown): TaskStatus | undefined {
	return typeof value === "string" ? (value as TaskStatus) : undefined;
}

export function createTasksRoutes(deps: TasksRouteDeps = defaultDeps) {
	return new Elysia({ name: "tasks-routes" })
		.get("/tasks", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = taskScope(crmProfile, deps);
			const status = parseTaskStatus(query.status);
			const assigneeProfileId =
				typeof query.assigneeProfileId === "string"
					? query.assigneeProfileId
					: undefined;
			const relatedCompanyId =
				typeof query.relatedCompanyId === "string"
					? query.relatedCompanyId
					: undefined;
			const relatedContactId =
				typeof query.relatedContactId === "string"
					? query.relatedContactId
					: undefined;
			const relatedDealId =
				typeof query.relatedDealId === "string"
					? query.relatedDealId
					: undefined;
			const items = await deps.listTasks(scope, {
				status,
				assigneeProfileId,
				relatedCompanyId,
				relatedContactId,
				relatedDealId,
			});

			return {
				items,
				page: 1,
				pageSize: items.length,
				total: items.length,
			};
		})
		.post("/tasks", async (ctx) => {
			const { crmProfile, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = taskScope(crmProfile, deps);
			const result = await deps.createTask(scope, body as TaskInput);

			return handleTaskMutationResult(result);
		})
		.get("/tasks/:id", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = taskScope(crmProfile, deps);
			const taskRecord = await deps.getTaskById(scope, params.id);

			if (!taskRecord) {
				notFoundError("Task not found");
			}

			return taskRecord;
		})
		.patch("/tasks/:id", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = taskScope(crmProfile, deps);
			const result = await deps.updateTask(
				scope,
				params.id,
				body as Partial<TaskInput>,
			);

			if (!result) {
				notFoundError("Task not found");
			}

			return handleTaskMutationResult(result);
		})
		.post("/tasks/:id/complete", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = taskScope(crmProfile, deps);
			const result = await deps.completeTask(scope, params.id);

			if (!result) {
				notFoundError("Task not found");
			}

			return result;
		})
		.post("/tasks/:id/reopen", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = taskScope(crmProfile, deps);
			const result = await deps.reopenTask(scope, params.id);

			if (!result) {
				notFoundError("Task not found");
			}

			return result;
		});
}

export const tasksRoutes = createTasksRoutes();

export type { TaskRecord };
