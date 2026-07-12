import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

import { createAdminUsersRoutes } from "../../modules/admin/routes";
import {
	createCrmAuthPlugin,
	type CrmAuthDependencies,
} from "../../modules/authz/middleware";
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

const managerProfile = {
	id: "profile-manager",
	userId: "user-manager",
	role: "sales_manager" as const,
	teamId: "team-a",
	status: "active" as const,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const repProfile = {
	id: "profile-rep",
	userId: "user-rep",
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

const adminUserRecord = {
	userId: "user-rep",
	profileId: "profile-rep",
	name: "Rep User",
	email: "rep@example.com",
	role: "sales_representative" as const,
	teamId: "team-a",
	teamName: "Team A",
	status: "active" as const,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createTestApp(options: {
	auth: CrmAuthDependencies;
	admin?: Partial<Parameters<typeof createAdminUsersRoutes>[0]>;
}) {
	return new Elysia()
		.use(createCrmAuthPlugin(options.auth))
		.group("/api/admin", (app) =>
			app.use(
				createAdminUsersRoutes({
					listAdminUsers: async () => [adminUserRecord],
					listTeams: async () => [{ id: "team-a", name: "Team A" }],
					getAdminUserByProfileId: async (profileId) =>
						profileId === "profile-rep" ? adminUserRecord : null,
					updateAdminUserRole: async (profileId, input) =>
						profileId === "profile-rep"
							? {
									...adminUserRecord,
									role: input.role,
									teamId: input.teamId ?? null,
								}
							: null,
					updateAdminUserStatus: async (profileId, status) =>
						profileId === "profile-rep"
							? {
									...adminUserRecord,
									status,
								}
							: null,
					createCrmProfile: async () => ({
						id: "profile-new",
						userId: "user-new",
						role: "sales_representative",
						teamId: "team-a",
						status: "active",
						createdAt: new Date("2026-01-01T00:00:00.000Z"),
						updatedAt: new Date("2026-01-01T00:00:00.000Z"),
					}),
					createAuthUser: async () => ({ userId: "user-new" }),
					...options.admin,
				}),
			),
		);
}

describe("admin users API integration", () => {
	test("GET /api/admin/users requires authentication", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => null,
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/admin/users"),
		);

		expect(response.status).toBe(401);
	});

	test("GET /api/admin/users denies non-administrator", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-manager" },
				}),
				loadProfile: async () => managerProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/admin/users", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(403);
		const body = (await response.json()) as { message: string };
		expect(body.message).toBe("Administrator access required");
	});

	test("GET /api/admin/users lists users for administrator", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/admin/users", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			items: Array<{ email: string }>;
			teams: Array<{ name: string }>;
		};
		expect(body.items[0]?.email).toBe("rep@example.com");
		expect(body.teams[0]?.name).toBe("Team A");
	});

	test("PATCH /api/admin/users/:id/role updates role", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/admin/users/profile-rep/role", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					role: "sales_manager",
					teamId: "team-a",
				}),
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { role: string };
		expect(body.role).toBe("sales_manager");
	});

	test("PATCH /api/admin/users/:id/status disables user", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/admin/users/profile-rep/status", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "disabled" }),
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as { status: string };
		expect(body.status).toBe("disabled");
	});

	test("PATCH /api/admin/users/:id/role returns validation errors", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			admin: {
				updateAdminUserRole: async () => ({
					valid: false as const,
					fieldErrors: {
						role: ["Invalid CRM role."],
					},
				}),
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/admin/users/profile-rep/role", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role: "invalid" }),
			}),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.fieldErrors.role).toContain("Invalid CRM role.");
	});

	test("disabled users are blocked from protected CRM routes", async () => {
		const app = new Elysia()
			.use(
				createCrmAuthPlugin({
					getSession: async () => ({
						user: { ...sessionUser, id: "user-rep" },
					}),
					loadProfile: async () => ({
						...repProfile,
						status: "disabled" as const,
					}),
				}),
			)
			.get("/api/crm/me", () => ({ ok: true }));

		const response = await app.handle(
			new Request("http://localhost/api/crm/me", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(403);
		const body = (await response.json()) as { message: string };
		expect(body.message).toBe("Account disabled");
	});
});
