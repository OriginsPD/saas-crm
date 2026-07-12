import type {
	AuthorizationScope,
	CompanyInput,
	CompanyRecord,
} from "@portfolio-saas-crm/db";
import {
	archiveCompany,
	createCompany,
	getCompanyById,
	listCompanies,
	updateCompany,
} from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { buildAuthorizationScope } from "../authz/scope";
import type { CrmProfileRecord } from "../authz/profile";
import {
	notFoundError,
	validateCompanyInput,
	validationError,
} from "../shared/errors";

export type CompaniesRouteDeps = {
	listCompanies: typeof listCompanies;
	getCompanyById: typeof getCompanyById;
	createCompany: typeof createCompany;
	updateCompany: typeof updateCompany;
	archiveCompany: typeof archiveCompany;
	listContactsForCompany: (
		scope: AuthorizationScope,
		companyId: string,
	) => Promise<unknown[]>;
	buildScope: (
		profile: CrmProfileRecord,
		resource: "companies" | "contacts",
	) => AuthorizationScope;
};

const defaultDeps: CompaniesRouteDeps = {
	listCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	archiveCompany,
	listContactsForCompany: async (scope, companyId) => {
		const { listContacts } = await import("@portfolio-saas-crm/db");
		return listContacts(scope, companyId);
	},
	buildScope: buildAuthorizationScope,
};

function companyScope(profile: CrmProfileRecord, deps: CompaniesRouteDeps) {
	return deps.buildScope(profile, "companies");
}

export function createCompaniesRoutes(deps: CompaniesRouteDeps = defaultDeps) {
	return new Elysia({ name: "companies-routes" })
		.get("/companies", async (ctx) => {
			const { crmProfile } = ctx as typeof ctx & CrmAuthContext;
			const scope = companyScope(crmProfile, deps);
			const items = await deps.listCompanies(scope);

			return {
				items,
				page: 1,
				pageSize: items.length,
				total: items.length,
			};
		})
		.post("/companies", async (ctx) => {
			const { crmProfile, body } = ctx as typeof ctx & CrmAuthContext;
			const input = body as CompanyInput;
			const fieldErrors = validateCompanyInput(input);

			if (fieldErrors) {
				validationError("Invalid company input.", fieldErrors);
			}

			const scope = companyScope(crmProfile, deps);
			const company = await deps.createCompany(scope, input);

			return company;
		})
		.get("/companies/:id", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = companyScope(crmProfile, deps);
			const company = await deps.getCompanyById(scope, params.id);

			if (!company) {
				notFoundError("Company not found");
			}

			const contacts = await deps.listContactsForCompany(scope, params.id);

			return {
				...company,
				contacts,
			};
		})
		.patch("/companies/:id", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			const input = body as Partial<CompanyInput>;

			if (input.name !== undefined) {
				const fieldErrors = validateCompanyInput({
					name: input.name,
				});

				if (fieldErrors) {
					validationError("Invalid company input.", fieldErrors);
				}
			}

			const scope = companyScope(crmProfile, deps);
			const company = await deps.updateCompany(scope, params.id, input);

			if (!company) {
				notFoundError("Company not found");
			}

			return company;
		})
		.post("/companies/:id/archive", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = companyScope(crmProfile, deps);
			const company = await deps.archiveCompany(scope, params.id);

			if (!company) {
				notFoundError("Company not found");
			}

			return company;
		});
}

export const companiesRoutes = createCompaniesRoutes();

export type { CompanyRecord };
