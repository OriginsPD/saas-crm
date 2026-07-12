import { and, eq, type SQL } from "drizzle-orm";

import {
	type AuthorizationScope,
	buildOwnerScopeFilter,
	canAccessOwnedRecord,
} from "../authorization/scope";
import { db } from "../index";
import { company, crmProfile } from "../schema/crm";

export type CompanyRecord = typeof company.$inferSelect;
export type CompanyInsert = typeof company.$inferInsert;

export type CompanyInput = {
	name: string;
	domain?: string | null;
	industry?: string | null;
	size?: CompanyRecord["size"] | null;
	status?: CompanyRecord["status"];
	notes?: string | null;
};

function companyScopeWhere(scope: AuthorizationScope): SQL | undefined {
	return buildOwnerScopeFilter(scope, company.ownerProfileId);
}

export async function listCompanies(
	scope: AuthorizationScope,
): Promise<CompanyRecord[]> {
	const scopeFilter = companyScopeWhere(scope);

	return db
		.select()
		.from(company)
		.where(scopeFilter ? and(scopeFilter) : undefined)
		.orderBy(company.name);
}

export async function getCompanyById(
	scope: AuthorizationScope,
	companyId: string,
): Promise<CompanyRecord | null> {
	const scopeFilter = companyScopeWhere(scope);
	const conditions = scopeFilter
		? and(eq(company.id, companyId), scopeFilter)
		: eq(company.id, companyId);

	const rows = await db.select().from(company).where(conditions).limit(1);

	return rows[0] ?? null;
}

export async function createCompany(
	scope: AuthorizationScope,
	input: CompanyInput,
): Promise<CompanyRecord> {
	const id = crypto.randomUUID();
	const ownerProfileId = scope.actorProfileId;

	const rows = await db
		.insert(company)
		.values({
			id,
			name: input.name.trim(),
			domain: input.domain?.trim() || null,
			industry: input.industry?.trim() || null,
			size: input.size ?? null,
			status: input.status ?? "prospect",
			ownerProfileId,
			notes: input.notes?.trim() || null,
		})
		.returning();

	return rows[0] as CompanyRecord;
}

export async function updateCompany(
	scope: AuthorizationScope,
	companyId: string,
	input: Partial<CompanyInput>,
): Promise<CompanyRecord | null> {
	const existing = await getCompanyById(scope, companyId);

	if (!existing) {
		return null;
	}

	const rows = await db
		.update(company)
		.set({
			name: input.name?.trim() ?? existing.name,
			domain:
				input.domain !== undefined
					? input.domain?.trim() || null
					: existing.domain,
			industry:
				input.industry !== undefined
					? input.industry?.trim() || null
					: existing.industry,
			size: input.size !== undefined ? input.size : existing.size,
			status: input.status ?? existing.status,
			notes:
				input.notes !== undefined
					? input.notes?.trim() || null
					: existing.notes,
		})
		.where(eq(company.id, companyId))
		.returning();

	return rows[0] ?? null;
}

export async function archiveCompany(
	scope: AuthorizationScope,
	companyId: string,
): Promise<CompanyRecord | null> {
	return updateCompany(scope, companyId, { status: "archived" });
}

export async function canAccessCompany(
	scope: AuthorizationScope,
	companyId: string,
): Promise<boolean> {
	const rows = await db
		.select({
			ownerProfileId: company.ownerProfileId,
			ownerTeamId: crmProfile.teamId,
		})
		.from(company)
		.innerJoin(crmProfile, eq(company.ownerProfileId, crmProfile.id))
		.where(eq(company.id, companyId))
		.limit(1);

	const record = rows[0];

	if (!record) {
		return false;
	}

	return canAccessOwnedRecord(scope, record.ownerProfileId, record.ownerTeamId);
}

export function buildCompanyListQuery(scope: AuthorizationScope) {
	const scopeFilter = companyScopeWhere(scope);

	return db
		.select()
		.from(company)
		.where(scopeFilter ? and(scopeFilter) : undefined);
}
