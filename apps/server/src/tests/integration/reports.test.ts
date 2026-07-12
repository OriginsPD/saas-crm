import type { CrmRole } from "@portfolio-saas-crm/auth";
import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

import {
	createCrmAuthPlugin,
	type CrmAuthDependencies,
} from "../../modules/authz/middleware";
import { createReportsRoutes } from "../../modules/reports/routes";
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

const pipelineReport = {
	stages: [
		{
			stage: "negotiation" as const,
			dealCount: 2,
			totalValueCents: 500000,
		},
	],
	totalOpenValueCents: 500000,
	totalOpenDeals: 2,
};

const performanceReport = {
	openDeals: 2,
	closedWonCount: 1,
	closedLostCount: 0,
	totalPipelineValueCents: 500000,
	activityCount: 4,
};

const taskReport = {
	openCount: 3,
	completedCount: 2,
	overdueCount: 1,
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
	reports?: Partial<Parameters<typeof createReportsRoutes>[0]>;
}) {
	return new Elysia()
		.use(createCrmAuthPlugin(options.auth))
		.group("/api/crm", (app) =>
			app.use(
				createReportsRoutes({
					getPipelineReport: async () => pipelineReport,
					getPerformanceReport: async () => performanceReport,
					getTaskReport: async () => taskReport,
					buildScope: () =>
						createScope(
							adminProfile.role,
							adminProfile.id,
							adminProfile.teamId,
						),
					...options.reports,
				}),
			),
		);
}

describe("reports API integration", () => {
	test("GET /api/crm/reports/pipeline requires authentication", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => null,
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/reports/pipeline"),
		);

		expect(response.status).toBe(401);
	});

	test("GET /api/crm/reports/pipeline returns scoped totals", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/reports/pipeline", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { totalOpenDeals: number };
		expect(body.totalOpenDeals).toBe(2);
	});

	test("GET /api/crm/reports/performance returns scoped metrics", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/reports/performance", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { activityCount: number };
		expect(body.activityCount).toBe(4);
	});

	test("GET /api/crm/reports/tasks returns task counts", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/reports/tasks", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { overdueCount: number };
		expect(body.overdueCount).toBe(1);
	});

	test("report filters reject invalid date range", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request(
				"http://localhost/api/crm/reports/pipeline?fromDate=2026-08-01&toDate=2026-07-01",
				{
					headers: { cookie: "session=test" },
				},
			),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.fieldErrors.toDate).toContain(
			"End date must be on or after start date.",
		);
	});

	test("representative report scope uses own assigned filter", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-rep-a" },
				}),
				loadProfile: async () => repProfile,
			},
			reports: {
				buildScope: () =>
					createScope(repProfile.role, repProfile.id, repProfile.teamId),
				getPerformanceReport: async (scope) => {
					expect(scope.access).toBe("own_assigned");
					expect(scope.actorProfileId).toBe("profile-rep-a");
					return performanceReport;
				},
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/reports/performance", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
	});
});
