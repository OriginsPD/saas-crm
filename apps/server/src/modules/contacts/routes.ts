import type {
	AuthorizationScope,
	ContactInput,
	ContactRecord,
	ContactValidationResult,
} from "@portfolio-saas-crm/db";
import {
	archiveContact,
	createContact,
	getContactById,
	listContacts,
	updateContact,
} from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { buildAuthorizationScope } from "../authz/scope";
import type { CrmProfileRecord } from "../authz/profile";
import { notFoundError, validationError } from "../shared/errors";

export type ContactsRouteDeps = {
	listContacts: typeof listContacts;
	getContactById: typeof getContactById;
	createContact: typeof createContact;
	updateContact: typeof updateContact;
	archiveContact: typeof archiveContact;
	buildScope: (
		profile: CrmProfileRecord,
		resource: "companies" | "contacts",
	) => AuthorizationScope;
};

const defaultDeps: ContactsRouteDeps = {
	listContacts,
	getContactById,
	createContact,
	updateContact,
	archiveContact,
	buildScope: buildAuthorizationScope,
};

function contactScope(profile: CrmProfileRecord, deps: ContactsRouteDeps) {
	return deps.buildScope(profile, "contacts");
}

function handleContactMutationResult(
	result: ContactRecord | ContactValidationResult | null,
) {
	if (!result) {
		notFoundError("Contact not found");
	}

	if ("valid" in result && !result.valid) {
		validationError("Invalid contact input.", result.fieldErrors);
	}

	return result as ContactRecord;
}

export function createContactsRoutes(deps: ContactsRouteDeps = defaultDeps) {
	return new Elysia({ name: "contacts-routes" })
		.get("/contacts", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = contactScope(crmProfile, deps);
			const companyId =
				typeof query.companyId === "string" ? query.companyId : undefined;
			const items = await deps.listContacts(scope, companyId);

			return {
				items,
				page: 1,
				pageSize: items.length,
				total: items.length,
			};
		})
		.post("/contacts", async (ctx) => {
			const { crmProfile, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = contactScope(crmProfile, deps);
			const result = await deps.createContact(scope, body as ContactInput);

			return handleContactMutationResult(result);
		})
		.get("/contacts/:id", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = contactScope(crmProfile, deps);
			const contactRecord = await deps.getContactById(scope, params.id);

			if (!contactRecord) {
				notFoundError("Contact not found");
			}

			return contactRecord;
		})
		.patch("/contacts/:id", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = contactScope(crmProfile, deps);
			const result = await deps.updateContact(
				scope,
				params.id,
				body as Partial<ContactInput>,
			);

			return handleContactMutationResult(result);
		})
		.post("/contacts/:id/archive", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = contactScope(crmProfile, deps);
			const contactRecord = await deps.archiveContact(scope, params.id);

			if (!contactRecord) {
				notFoundError("Contact not found");
			}

			return contactRecord;
		});
}

export const contactsRoutes = createContactsRoutes();
