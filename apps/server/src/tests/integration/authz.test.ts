import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

import {
	createCrmAuthPlugin,
	type CrmAuthDependencies,
} from "../../modules/authz/middleware";
import {
	buildCrmMeResponse,
	type CrmMeResponse,
} from "../../modules/authz/profile";

const activeProfile = {
	id: "profile-admin",
	userId: "user-admin",
	role: "administrator" as const,
	teamId: null,
	status: "active" as const,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const disabledProfile = {
	...activeProfile,
	id: "profile-disabled",
	userId: "user-disabled",
	status: "disabled" as const,
};

const sessionUser = {
	id: "user-admin",
	name: "Admin User",
	email: "admin@example.com",
	emailVerified: true,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createAuthzTestApp(options: CrmAuthDependencies) {
	return new Elysia()
		.use(createCrmAuthPlugin(options))
		.get("/api/crm/me", ({ crmSession, crmProfile }) =>
			buildCrmMeResponse(crmSession.user, crmProfile),
		);
}

describe("CRM authz integration", () => {
	test("GET /api/crm/me returns 401 without session", async () => {
		const app = createAuthzTestApp({
			getSession: async () => null,
			loadProfile: async () => activeProfile,
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/me"),
		);

		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({
			code: "UNAUTHENTICATED",
			message: "Authentication required",
		});
	});

	test("GET /api/crm/me returns profile and permissions for authenticated user", async () => {
		const app = createAuthzTestApp({
			getSession: async () => ({ user: sessionUser }),
			loadProfile: async (userId) =>
				userId === sessionUser.id ? activeProfile : null,
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/me", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(200);
		const body = (await response.json()) as CrmMeResponse;

		expect(body.user).toEqual({
			id: sessionUser.id,
			name: sessionUser.name,
			email: sessionUser.email,
		});
		expect(body.profile).toEqual({
			id: activeProfile.id,
			role: "administrator",
			status: "active",
			teamId: null,
		});
		expect(body.permissions).toContain("users.manage");
		expect(body.viewScopes.companies).toBe("all");
	});

	test("GET /api/crm/me returns 403 for disabled CRM profile", async () => {
		const app = createAuthzTestApp({
			getSession: async () => ({
				user: { ...sessionUser, id: "user-disabled" },
			}),
			loadProfile: async (userId) =>
				userId === "user-disabled" ? disabledProfile : null,
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/me", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(403);
		await expect(response.json()).resolves.toEqual({
			code: "FORBIDDEN",
			message: "Account disabled",
		});
	});

	test("protected CRM route denies unauthenticated access", async () => {
		const app = createAuthzTestApp({
			getSession: async () => null,
			loadProfile: async () => null,
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/me", { method: "GET" }),
		);

		expect(response.status).toBe(401);
	});
});
