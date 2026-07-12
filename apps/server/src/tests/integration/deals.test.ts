import type { CrmRole } from "@portfolio-saas-crm/auth";
import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

import {
	createCrmAuthPlugin,
	type CrmAuthDependencies,
} from "../../modules/authz/middleware";
import {
	createDealsRoutes,
	type StageChangeActivityInput,
} from "../../modules/deals/routes";
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

const dealRecord = {
	id: "deal-1",
	companyId: "company-1",
	ownerProfileId: "profile-rep-b",
	title: "Expansion",
	valueCents: 250000,
	currency: "USD",
	stage: "negotiation" as const,
	probability: 60,
	expectedCloseDate: "2026-12-31",
	closedAt: null,
	lossReason: null,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
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
	deals?: Partial<Parameters<typeof createDealsRoutes>[0]>;
	recordedActivities?: StageChangeActivityInput[];
}) {
	const recordedActivities = options.recordedActivities ?? [];

	return new Elysia()
		.use(createCrmAuthPlugin(options.auth))
		.group("/api/crm", (app) =>
			app.use(
				createDealsRoutes({
					listDeals: async () => [dealRecord],
					getDealById: async (scope, id) =>
						scope.access === "own_assigned" && id === "deal-1"
							? null
							: dealRecord,
					createDeal: async () => dealRecord,
					updateDeal: async () => dealRecord,
					moveDealStage: async (_scope, _id, input) => ({
						...dealRecord,
						stage: input.stage,
						closedAt:
							input.stage === "closed_won"
								? new Date("2026-07-01T00:00:00.000Z")
								: null,
						lossReason:
							input.stage === "closed_lost"
								? (input.lossReason ?? "Budget")
								: null,
					}),
					getPipelineTotals: async () => [
						{
							stage: "negotiation" as const,
							dealCount: 1,
							totalValueCents: 250000,
						},
					],
					listDealContactIds: async () => ["contact-1"],
					recordStageChangeActivity: async (input) => {
						recordedActivities.push(input);
						return { id: "activity-1" };
					},
					buildScope: (_profile) =>
						createScope(
							adminProfile.role,
							adminProfile.id,
							adminProfile.teamId,
						),
					...options.deals,
				}),
			),
		);
}

describe("deals API integration", () => {
	test("GET /api/crm/deals requires authentication", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => null,
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/deals"),
		);

		expect(response.status).toBe(401);
	});

	test("POST /api/crm/deals returns field errors for invalid input", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			deals: {
				createDeal: async () => ({
					valid: false as const,
					fieldErrors: {
						valueCents: ["Deal value must be a non-negative integer."],
					},
				}),
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/deals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					companyId: "company-1",
					title: "Expansion",
					valueCents: -1,
					probability: 50,
				}),
			}),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.code).toBe("VALIDATION_ERROR");
		expect(body.fieldErrors.valueCents).toContain(
			"Deal value must be a non-negative integer.",
		);
	});

	test("GET /api/crm/deals/:id hides inaccessible records", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-rep-a" },
				}),
				loadProfile: async () => repProfile,
			},
			deals: {
				buildScope: () =>
					createScope(repProfile.role, repProfile.id, repProfile.teamId),
				getDealById: async () => null,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/deals/deal-1", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(404);
	});

	test("POST /api/crm/deals/:id/stage records stage change activity", async () => {
		const recordedActivities: StageChangeActivityInput[] = [];
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			recordedActivities,
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/deals/deal-1/stage", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					stage: "closed_won",
					expectedCloseDate: "2026-12-31",
				}),
			}),
		);

		expect(response.status).toBe(200);
		expect(recordedActivities).toHaveLength(1);
		expect(recordedActivities[0]).toMatchObject({
			dealId: "deal-1",
			companyId: "company-1",
			fromStage: "negotiation",
			toStage: "closed_won",
			actorProfileId: "profile-admin",
		});
	});

	test("representative cannot update another users deal", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-rep-a" },
				}),
				loadProfile: async () => repProfile,
			},
			deals: {
				buildScope: () =>
					createScope(repProfile.role, repProfile.id, repProfile.teamId),
				updateDeal: async () => null,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/deals/deal-1", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: "Blocked update" }),
			}),
		);

		expect(response.status).toBe(404);
	});

	test("GET /api/crm/deals/pipeline returns scoped totals", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/deals/pipeline", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			stages: Array<{ stage: string; dealCount: number }>;
		};
		expect(body.stages[0]?.dealCount).toBe(1);
	});
});
