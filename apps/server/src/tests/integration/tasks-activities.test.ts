import type { CrmRole } from "@portfolio-saas-crm/auth";
import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

import { createActivitiesRoutes } from "../../modules/activities/routes";
import {
	createCrmAuthPlugin,
	type CrmAuthDependencies,
} from "../../modules/authz/middleware";
import { createTasksRoutes } from "../../modules/tasks/routes";
import type { ValidationErrorBody } from "../../modules/shared/errors";

const adminProfile = {
	id: "profile-admin",
	userId: "user-admin",
	role: "administrator" as const,
	teamId: null,
	status: "active" as const,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const repProfile = {
	id: "profile-rep-a",
	userId: "user-rep-a",
	role: "sales_representative" as const,
	teamId: "team-a",
	status: "active" as const,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const sessionUser = {
	id: "user-admin",
	name: "Admin User",
	email: "admin@example.com",
};

const openTask = {
	id: "task-1",
	title: "Follow up proposal",
	description: "Send revised pricing",
	assigneeProfileId: "profile-rep-a",
	relatedCompanyId: "company-1",
	relatedContactId: null,
	relatedDealId: "deal-1",
	dueDate: "2026-08-01",
	priority: "high" as const,
	status: "open" as const,
	completedAt: null,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const completedTask = {
	...openTask,
	status: "completed" as const,
	completedAt: new Date("2026-07-01T00:00:00.000Z"),
};

const activityRecord = {
	id: "activity-1",
	type: "note" as const,
	subject: "Discovery call",
	body: "Discussed timeline.",
	actorProfileId: "profile-rep-a",
	relatedCompanyId: "company-1",
	relatedContactId: null,
	relatedDealId: "deal-1",
	occurredAt: new Date("2026-07-02T10:00:00.000Z"),
	createdAt: new Date("2026-07-02T10:00:00.000Z"),
};

function createScope(role: CrmRole, profileId: string, teamId: string | null) {
	return {
		access:
			role === "administrator"
				? ("all" as const)
				: role === "sales_manager"
					? ("team_owned" as const)
					: ("own_assigned" as const),
		actorProfileId: profileId,
		actorTeamId: teamId,
	};
}

function createTestApp(options: {
	auth: CrmAuthDependencies;
	tasks?: Partial<Parameters<typeof createTasksRoutes>[0]>;
	activities?: Partial<Parameters<typeof createActivitiesRoutes>[0]>;
}) {
	return new Elysia()
		.use(createCrmAuthPlugin(options.auth))
		.group("/api/crm", (app) =>
			app
				.use(
					createTasksRoutes({
						listTasks: async () => [openTask],
						getTaskById: async () => openTask,
						createTask: async () => openTask,
						updateTask: async () => openTask,
						completeTask: async () => completedTask,
						reopenTask: async () => openTask,
						buildScope: () =>
							createScope(
								adminProfile.role,
								adminProfile.id,
								adminProfile.teamId,
							),
						...options.tasks,
					}),
				)
				.use(
					createActivitiesRoutes({
						listActivities: async () => [activityRecord],
						createActivity: async (input) => ({
							...activityRecord,
							...input,
							id: "activity-new",
						}),
						buildScope: () =>
							createScope(
								adminProfile.role,
								adminProfile.id,
								adminProfile.teamId,
							),
						...options.activities,
					}),
				),
		);
}

describe("tasks API integration", () => {
	test("GET /api/crm/tasks requires authentication", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => null,
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/tasks"),
		);

		expect(response.status).toBe(401);
	});

	test("POST /api/crm/tasks returns field errors for invalid input", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			tasks: {
				createTask: async () => ({
					valid: false as const,
					fieldErrors: {
						title: ["Task title is required."],
					},
				}),
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/tasks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: "",
					assigneeProfileId: "profile-rep-a",
				}),
			}),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.fieldErrors.title).toContain("Task title is required.");
	});

	test("POST /api/crm/tasks/:id/complete returns completed task", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/tasks/task-1/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			status: string;
			completedAt: string;
		};
		expect(body.status).toBe("completed");
		expect(body.completedAt).toBeTruthy();
	});

	test("POST /api/crm/tasks/:id/reopen clears completion", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/tasks/task-1/reopen", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			status: string;
			completedAt: string | null;
		};
		expect(body.status).toBe("open");
		expect(body.completedAt).toBeNull();
	});

	test("representative cannot complete inaccessible task", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-rep-a" },
				}),
				loadProfile: async () => repProfile,
			},
			tasks: {
				buildScope: () =>
					createScope(repProfile.role, repProfile.id, repProfile.teamId),
				completeTask: async () => null,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/tasks/task-1/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}),
		);

		expect(response.status).toBe(404);
	});
});

describe("activity API integration", () => {
	test("GET /api/crm/activity filters by related deal", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			activities: {
				listActivities: async (_scope, options) => {
					expect(options?.relatedDealId).toBe("deal-1");
					return [activityRecord];
				},
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/activity?relatedDealId=deal-1", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			items: Array<{ subject: string }>;
		};
		expect(body.items[0]?.subject).toBe("Discovery call");
	});

	test("POST /api/crm/activity returns validation errors without related entity", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			activities: {
				createActivity: async () => ({
					valid: false as const,
					fieldErrors: {
						relatedCompanyId: [
							"Activity must relate to a company, contact, or deal.",
						],
					},
				}),
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/activity", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "note",
					subject: "Missing relation",
				}),
			}),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.fieldErrors.relatedCompanyId).toContain(
			"Activity must relate to a company, contact, or deal.",
		);
	});

	test("POST /api/crm/activity logs note on company", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/activity", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					type: "note",
					subject: "Account review",
					body: "Renewal discussion.",
					relatedCompanyId: "company-1",
				}),
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			subject: string;
			actorProfileId: string;
		};
		expect(body.subject).toBe("Account review");
		expect(body.actorProfileId).toBe("profile-admin");
	});
});
