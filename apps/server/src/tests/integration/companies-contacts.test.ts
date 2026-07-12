import type { CrmRole } from "@portfolio-saas-crm/auth";
import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";

import {
	createCrmAuthPlugin,
	type CrmAuthDependencies,
} from "../../modules/authz/middleware";
import { createCompaniesRoutes } from "../../modules/companies/routes";
import { createContactsRoutes } from "../../modules/contacts/routes";
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

const companyRecord = {
	id: "company-1",
	name: "Acme Corp",
	domain: "acme.example",
	industry: "Software",
	size: "smb" as const,
	status: "active" as const,
	ownerProfileId: "profile-rep-b",
	notes: null,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const contactRecord = {
	id: "contact-1",
	companyId: "company-1",
	firstName: "Alex",
	lastName: "Nguyen",
	title: "CEO",
	email: "alex@acme.example",
	phone: null,
	status: "active" as const,
	ownerProfileId: "profile-rep-b",
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
	companies?: Partial<Parameters<typeof createCompaniesRoutes>[0]>;
	contacts?: Partial<Parameters<typeof createContactsRoutes>[0]>;
}) {
	return new Elysia()
		.use(createCrmAuthPlugin(options.auth))
		.group("/api/crm", (app) =>
			app
				.use(
					createCompaniesRoutes({
						listCompanies: async () => [companyRecord],
						getCompanyById: async (scope, id) =>
							scope.access === "own_assigned" && id === "company-1"
								? null
								: companyRecord,
						createCompany: async (_scope, input) => ({
							...companyRecord,
							...input,
							id: "company-new",
						}),
						updateCompany: async () => companyRecord,
						archiveCompany: async () => ({
							...companyRecord,
							status: "archived" as const,
						}),
						listContactsForCompany: async () => [contactRecord],
						buildScope: (_profile) =>
							createScope(
								adminProfile.role,
								adminProfile.id,
								adminProfile.teamId,
							),
						...options.companies,
					}),
				)
				.use(
					createContactsRoutes({
						listContacts: async () => [contactRecord],
						getContactById: async (scope, id) =>
							scope.access === "own_assigned" && id === "contact-1"
								? null
								: contactRecord,
						createContact: async () => contactRecord,
						updateContact: async () => contactRecord,
						archiveContact: async () => ({
							...contactRecord,
							status: "archived" as const,
						}),
						buildScope: (_profile) =>
							createScope(
								adminProfile.role,
								adminProfile.id,
								adminProfile.teamId,
							),
						...options.contacts,
					}),
				),
		);
}

describe("companies and contacts API integration", () => {
	test("GET /api/crm/companies requires authentication", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => null,
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/companies"),
		);

		expect(response.status).toBe(401);
	});

	test("POST /api/crm/companies returns field errors for invalid input", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/companies", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "   " }),
			}),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.code).toBe("VALIDATION_ERROR");
		expect(body.fieldErrors.name).toContain("Company name is required.");
	});

	test("GET /api/crm/companies/:id hides inaccessible records", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-rep-a" },
				}),
				loadProfile: async () => repProfile,
			},
			companies: {
				buildScope: () =>
					createScope(repProfile.role, repProfile.id, repProfile.teamId),
				getCompanyById: async () => null,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/companies/company-1", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	test("POST /api/crm/contacts returns field errors when email and phone missing", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
			contacts: {
				createContact: async () => ({
					valid: false as const,
					fieldErrors: {
						email: ["Email or phone is required."],
						phone: ["Email or phone is required."],
					},
				}),
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/contacts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					companyId: "company-1",
					firstName: "Alex",
					lastName: "Nguyen",
				}),
			}),
		);

		expect(response.status).toBe(400);
		const body = (await response.json()) as ValidationErrorBody;
		expect(body.code).toBe("VALIDATION_ERROR");
		expect(body.fieldErrors.email).toContain("Email or phone is required.");
	});

	test("representative cannot read another users contact", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({
					user: { ...sessionUser, id: "user-rep-a" },
				}),
				loadProfile: async () => repProfile,
			},
			contacts: {
				buildScope: () =>
					createScope(repProfile.role, repProfile.id, repProfile.teamId),
				getContactById: async () => null,
			},
		});

		const response = await app.handle(
			new Request("http://localhost/api/crm/contacts/contact-1", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(response.status).toBe(404);
	});

	test("administrator can list companies and contacts", async () => {
		const app = createTestApp({
			auth: {
				getSession: async () => ({ user: sessionUser }),
				loadProfile: async () => adminProfile,
			},
		});

		const companiesResponse = await app.handle(
			new Request("http://localhost/api/crm/companies", {
				headers: { cookie: "session=test" },
			}),
		);
		const contactsResponse = await app.handle(
			new Request("http://localhost/api/crm/contacts", {
				headers: { cookie: "session=test" },
			}),
		);

		expect(companiesResponse.status).toBe(200);
		expect(contactsResponse.status).toBe(200);

		const companiesBody = (await companiesResponse.json()) as {
			items: unknown[];
		};
		const contactsBody = (await contactsResponse.json()) as {
			items: unknown[];
		};

		expect(companiesBody.items).toHaveLength(1);
		expect(contactsBody.items).toHaveLength(1);
	});
});
