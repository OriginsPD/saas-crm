import { and, eq, type SQL } from "drizzle-orm";

import {
	type AuthorizationScope,
	buildOwnerScopeFilter,
	canAccessOwnedRecord,
} from "../authorization/scope";
import { db } from "../index";
import { contact, crmProfile } from "../schema/crm";
import { getCompanyById } from "./companies";

export type ContactRecord = typeof contact.$inferSelect;
export type ContactInsert = typeof contact.$inferInsert;

export type ContactInput = {
	companyId: string;
	firstName: string;
	lastName: string;
	title?: string | null;
	email?: string | null;
	phone?: string | null;
	status?: ContactRecord["status"];
};

export type ContactValidationResult =
	| { valid: true; value: ContactInput }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

export function validateContactInput(
	input: ContactInput,
): ContactValidationResult {
	const fieldErrors: Record<string, string[]> = {};

	if (!input.firstName.trim()) {
		fieldErrors.firstName = ["First name is required."];
	}

	if (!input.lastName.trim()) {
		fieldErrors.lastName = ["Last name is required."];
	}

	const email = input.email?.trim() ?? "";
	const phone = input.phone?.trim() ?? "";

	if (!email && !phone) {
		fieldErrors.email = ["Email or phone is required."];
		fieldErrors.phone = ["Email or phone is required."];
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	return {
		valid: true,
		value: {
			...input,
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
			title: input.title?.trim() || null,
			email: email || null,
			phone: phone || null,
		},
	};
}

function contactScopeWhere(scope: AuthorizationScope): SQL | undefined {
	return buildOwnerScopeFilter(scope, contact.ownerProfileId);
}

export async function listContacts(
	scope: AuthorizationScope,
	companyId?: string,
): Promise<ContactRecord[]> {
	const scopeFilter = contactScopeWhere(scope);
	const conditions = companyId
		? scopeFilter
			? and(eq(contact.companyId, companyId), scopeFilter)
			: eq(contact.companyId, companyId)
		: scopeFilter;

	return db
		.select()
		.from(contact)
		.where(conditions)
		.orderBy(contact.lastName, contact.firstName);
}

export async function getContactById(
	scope: AuthorizationScope,
	contactId: string,
): Promise<ContactRecord | null> {
	const scopeFilter = contactScopeWhere(scope);
	const conditions = scopeFilter
		? and(eq(contact.id, contactId), scopeFilter)
		: eq(contact.id, contactId);

	const rows = await db.select().from(contact).where(conditions).limit(1);

	return rows[0] ?? null;
}

export async function createContact(
	scope: AuthorizationScope,
	input: ContactInput,
): Promise<ContactRecord | ContactValidationResult> {
	const validation = validateContactInput(input);

	if (!validation.valid) {
		return validation;
	}

	const parentCompany = await getCompanyById(scope, validation.value.companyId);

	if (!parentCompany) {
		return {
			valid: false,
			fieldErrors: {
				companyId: ["Company not found or inaccessible."],
			},
		};
	}

	const id = crypto.randomUUID();
	const rows = await db
		.insert(contact)
		.values({
			id,
			companyId: validation.value.companyId,
			firstName: validation.value.firstName,
			lastName: validation.value.lastName,
			title: validation.value.title,
			email: validation.value.email,
			phone: validation.value.phone,
			status: validation.value.status ?? "active",
			ownerProfileId: scope.actorProfileId,
		})
		.returning();

	return rows[0] as ContactRecord;
}

export async function updateContact(
	scope: AuthorizationScope,
	contactId: string,
	input: Partial<ContactInput>,
): Promise<ContactRecord | ContactValidationResult | null> {
	const existing = await getContactById(scope, contactId);

	if (!existing) {
		return null;
	}

	const merged: ContactInput = {
		companyId: existing.companyId,
		firstName: input.firstName ?? existing.firstName,
		lastName: input.lastName ?? existing.lastName,
		title: input.title !== undefined ? input.title : existing.title,
		email: input.email !== undefined ? input.email : existing.email,
		phone: input.phone !== undefined ? input.phone : existing.phone,
		status: input.status ?? existing.status,
	};

	const validation = validateContactInput(merged);

	if (!validation.valid) {
		return validation;
	}

	const rows = await db
		.update(contact)
		.set({
			firstName: validation.value.firstName,
			lastName: validation.value.lastName,
			title: validation.value.title,
			email: validation.value.email,
			phone: validation.value.phone,
			status: validation.value.status ?? existing.status,
		})
		.where(eq(contact.id, contactId))
		.returning();

	return rows[0] ?? null;
}

export async function archiveContact(
	scope: AuthorizationScope,
	contactId: string,
): Promise<ContactRecord | null> {
	const result = await updateContact(scope, contactId, { status: "archived" });

	if (!result || "valid" in result) {
		return null;
	}

	return result;
}

export async function canAccessContact(
	scope: AuthorizationScope,
	contactId: string,
): Promise<boolean> {
	const rows = await db
		.select({
			ownerProfileId: contact.ownerProfileId,
			ownerTeamId: crmProfile.teamId,
		})
		.from(contact)
		.innerJoin(crmProfile, eq(contact.ownerProfileId, crmProfile.id))
		.where(eq(contact.id, contactId))
		.limit(1);

	const record = rows[0];

	if (!record) {
		return false;
	}

	return canAccessOwnedRecord(scope, record.ownerProfileId, record.ownerTeamId);
}

export function buildContactListQuery(
	scope: AuthorizationScope,
	companyId?: string,
) {
	const scopeFilter = contactScopeWhere(scope);
	const conditions = companyId
		? scopeFilter
			? and(eq(contact.companyId, companyId), scopeFilter)
			: eq(contact.companyId, companyId)
		: scopeFilter;

	return db.select().from(contact).where(conditions);
}
