import { and, count, eq, sum, type SQL } from "drizzle-orm";

import {
	type AuthorizationScope,
	buildOwnerScopeFilter,
	canAccessOwnedRecord,
} from "../authorization/scope";
import { db } from "../index";
import { crmProfile, deal, dealContact } from "../schema/crm";
import { getCompanyById } from "./companies";

export const DEAL_STAGES = [
	"prospecting",
	"qualified",
	"proposal",
	"negotiation",
	"closed_won",
	"closed_lost",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export type DealRecord = typeof deal.$inferSelect;
export type DealInsert = typeof deal.$inferInsert;

export type DealInput = {
	companyId: string;
	title: string;
	valueCents: number;
	currency?: string;
	stage?: DealStage;
	probability: number;
	expectedCloseDate?: string | null;
	contactIds?: string[];
};

export type StageTransitionInput = {
	stage: DealStage;
	closedAt?: Date | null;
	lossReason?: string | null;
	expectedCloseDate?: string | null;
};

export type DealValidationResult =
	| { valid: true; value: DealInput }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

export type StageTransitionValidationResult =
	| {
			valid: true;
			value: {
				stage: DealStage;
				closedAt: Date | null;
				lossReason: string | null;
				expectedCloseDate: string | null;
			};
	  }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

export type PipelineStageTotal = {
	stage: DealStage;
	dealCount: number;
	totalValueCents: number;
};

function isClosedStage(stage: DealStage): boolean {
	return stage === "closed_won" || stage === "closed_lost";
}

function parseDateOnly(value: string | null | undefined): string | null {
	if (!value?.trim()) {
		return null;
	}

	return value.trim();
}

export function validateDealInput(input: DealInput): DealValidationResult {
	const fieldErrors: Record<string, string[]> = {};

	if (!input.title.trim()) {
		fieldErrors.title = ["Deal title is required."];
	}

	if (!input.companyId.trim()) {
		fieldErrors.companyId = ["Company is required."];
	}

	if (!Number.isInteger(input.valueCents) || input.valueCents < 0) {
		fieldErrors.valueCents = ["Deal value must be a non-negative integer."];
	}

	if (
		!Number.isInteger(input.probability) ||
		input.probability < 0 ||
		input.probability > 100
	) {
		fieldErrors.probability = ["Probability must be between 0 and 100."];
	}

	if (input.stage && !DEAL_STAGES.includes(input.stage)) {
		fieldErrors.stage = ["Invalid deal stage."];
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	return {
		valid: true,
		value: {
			...input,
			title: input.title.trim(),
			currency: input.currency?.trim() || "USD",
			stage: input.stage ?? "prospecting",
			expectedCloseDate: parseDateOnly(input.expectedCloseDate),
		},
	};
}

export function validateStageTransition(
	existing: Pick<
		DealRecord,
		"stage" | "expectedCloseDate" | "closedAt" | "lossReason"
	>,
	input: StageTransitionInput,
): StageTransitionValidationResult {
	const fieldErrors: Record<string, string[]> = {};
	const nextStage = input.stage;
	const expectedCloseDate =
		parseDateOnly(input.expectedCloseDate) ??
		(existing.expectedCloseDate ? String(existing.expectedCloseDate) : null);

	if (!DEAL_STAGES.includes(nextStage)) {
		fieldErrors.stage = ["Invalid deal stage."];
	}

	if (isClosedStage(nextStage)) {
		if (!expectedCloseDate) {
			fieldErrors.expectedCloseDate = [
				"Expected close date is required before closing a deal.",
			];
		}

		if (nextStage === "closed_lost") {
			const lossReason =
				input.lossReason?.trim() || existing.lossReason?.trim();

			if (!lossReason) {
				fieldErrors.lossReason = [
					"Loss reason is required for closed-lost deals.",
				];
			}
		}
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	const closedAt = isClosedStage(nextStage)
		? (input.closedAt ?? existing.closedAt ?? new Date())
		: null;

	return {
		valid: true,
		value: {
			stage: nextStage,
			closedAt,
			lossReason:
				nextStage === "closed_lost"
					? input.lossReason?.trim() || existing.lossReason || null
					: null,
			expectedCloseDate,
		},
	};
}

function dealScopeWhere(scope: AuthorizationScope): SQL | undefined {
	return buildOwnerScopeFilter(scope, deal.ownerProfileId);
}

export async function listDeals(
	scope: AuthorizationScope,
	options?: { companyId?: string; stage?: DealStage },
): Promise<DealRecord[]> {
	const scopeFilter = dealScopeWhere(scope);
	const filters: SQL[] = [];

	if (options?.companyId) {
		filters.push(eq(deal.companyId, options.companyId));
	}

	if (options?.stage) {
		filters.push(eq(deal.stage, options.stage));
	}

	if (scopeFilter) {
		filters.push(scopeFilter);
	}

	return db
		.select()
		.from(deal)
		.where(filters.length > 0 ? and(...filters) : undefined)
		.orderBy(deal.updatedAt);
}

export async function getDealById(
	scope: AuthorizationScope,
	dealId: string,
): Promise<DealRecord | null> {
	const scopeFilter = dealScopeWhere(scope);
	const conditions = scopeFilter
		? and(eq(deal.id, dealId), scopeFilter)
		: eq(deal.id, dealId);

	const rows = await db.select().from(deal).where(conditions).limit(1);

	return rows[0] ?? null;
}

async function assertCompanyAllowsOpenDeal(
	scope: AuthorizationScope,
	companyId: string,
	stage: DealStage,
): Promise<DealValidationResult | null> {
	if (isClosedStage(stage)) {
		return null;
	}

	const parentCompany = await getCompanyById(scope, companyId);

	if (!parentCompany) {
		return {
			valid: false,
			fieldErrors: {
				companyId: ["Company not found or inaccessible."],
			},
		};
	}

	if (parentCompany.status === "archived") {
		return {
			valid: false,
			fieldErrors: {
				companyId: ["Archived companies cannot receive new open deals."],
			},
		};
	}

	return null;
}

async function syncDealContacts(dealId: string, contactIds: string[] = []) {
	await db.delete(dealContact).where(eq(dealContact.dealId, dealId));

	if (contactIds.length === 0) {
		return;
	}

	await db.insert(dealContact).values(
		contactIds.map((contactId) => ({
			dealId,
			contactId,
		})),
	);
}

export async function createDeal(
	scope: AuthorizationScope,
	input: DealInput,
): Promise<DealRecord | DealValidationResult> {
	const validation = validateDealInput(input);

	if (!validation.valid) {
		return validation;
	}

	const companyError = await assertCompanyAllowsOpenDeal(
		scope,
		validation.value.companyId,
		validation.value.stage ?? "prospecting",
	);

	if (companyError) {
		return companyError;
	}

	const id = crypto.randomUUID();
	const rows = await db
		.insert(deal)
		.values({
			id,
			companyId: validation.value.companyId,
			ownerProfileId: scope.actorProfileId,
			title: validation.value.title,
			valueCents: validation.value.valueCents,
			currency: validation.value.currency ?? "USD",
			stage: validation.value.stage ?? "prospecting",
			probability: validation.value.probability,
			expectedCloseDate: validation.value.expectedCloseDate,
		})
		.returning();

	if (validation.value.contactIds?.length) {
		await syncDealContacts(id, validation.value.contactIds);
	}

	return rows[0] as DealRecord;
}

export async function updateDeal(
	scope: AuthorizationScope,
	dealId: string,
	input: Partial<DealInput>,
): Promise<DealRecord | DealValidationResult | null> {
	const existing = await getDealById(scope, dealId);

	if (!existing) {
		return null;
	}

	const merged: DealInput = {
		companyId: input.companyId ?? existing.companyId,
		title: input.title ?? existing.title,
		valueCents: input.valueCents ?? existing.valueCents,
		currency: input.currency ?? existing.currency,
		stage: input.stage ?? existing.stage,
		probability: input.probability ?? existing.probability,
		expectedCloseDate:
			input.expectedCloseDate !== undefined
				? input.expectedCloseDate
				: existing.expectedCloseDate
					? String(existing.expectedCloseDate)
					: null,
		contactIds: input.contactIds,
	};

	const validation = validateDealInput(merged);

	if (!validation.valid) {
		return validation;
	}

	const companyError = await assertCompanyAllowsOpenDeal(
		scope,
		validation.value.companyId,
		validation.value.stage ?? existing.stage,
	);

	if (companyError) {
		return companyError;
	}

	const rows = await db
		.update(deal)
		.set({
			companyId: validation.value.companyId,
			title: validation.value.title,
			valueCents: validation.value.valueCents,
			currency: validation.value.currency ?? existing.currency,
			stage: validation.value.stage ?? existing.stage,
			probability: validation.value.probability,
			expectedCloseDate: validation.value.expectedCloseDate,
		})
		.where(eq(deal.id, dealId))
		.returning();

	if (input.contactIds) {
		await syncDealContacts(dealId, input.contactIds);
	}

	return rows[0] ?? null;
}

export async function moveDealStage(
	scope: AuthorizationScope,
	dealId: string,
	input: StageTransitionInput,
): Promise<DealRecord | StageTransitionValidationResult | null> {
	const existing = await getDealById(scope, dealId);

	if (!existing) {
		return null;
	}

	const validation = validateStageTransition(existing, input);

	if (!validation.valid) {
		return validation;
	}

	const rows = await db
		.update(deal)
		.set({
			stage: validation.value.stage,
			closedAt: validation.value.closedAt,
			lossReason: validation.value.lossReason,
			expectedCloseDate: validation.value.expectedCloseDate,
		})
		.where(eq(deal.id, dealId))
		.returning();

	return rows[0] ?? null;
}

export async function getPipelineTotals(
	scope: AuthorizationScope,
): Promise<PipelineStageTotal[]> {
	const scopeFilter = dealScopeWhere(scope);

	const rows = await db
		.select({
			stage: deal.stage,
			dealCount: count(deal.id),
			totalValueCents: sum(deal.valueCents),
		})
		.from(deal)
		.where(scopeFilter ? and(scopeFilter) : undefined)
		.groupBy(deal.stage);

	const totalsByStage = new Map<DealStage, PipelineStageTotal>();

	for (const stage of DEAL_STAGES) {
		totalsByStage.set(stage, {
			stage,
			dealCount: 0,
			totalValueCents: 0,
		});
	}

	for (const row of rows) {
		totalsByStage.set(row.stage, {
			stage: row.stage,
			dealCount: Number(row.dealCount),
			totalValueCents: Number(row.totalValueCents ?? 0),
		});
	}

	return DEAL_STAGES.map((stage) => totalsByStage.get(stage)!);
}

export async function canAccessDeal(
	scope: AuthorizationScope,
	dealId: string,
): Promise<boolean> {
	const rows = await db
		.select({
			ownerProfileId: deal.ownerProfileId,
			ownerTeamId: crmProfile.teamId,
		})
		.from(deal)
		.innerJoin(crmProfile, eq(deal.ownerProfileId, crmProfile.id))
		.where(eq(deal.id, dealId))
		.limit(1);

	const record = rows[0];

	if (!record) {
		return false;
	}

	return canAccessOwnedRecord(scope, record.ownerProfileId, record.ownerTeamId);
}

export function buildDealListQuery(
	scope: AuthorizationScope,
	options?: { companyId?: string; stage?: DealStage },
) {
	const scopeFilter = dealScopeWhere(scope);
	const filters: SQL[] = [];

	if (options?.companyId) {
		filters.push(eq(deal.companyId, options.companyId));
	}

	if (options?.stage) {
		filters.push(eq(deal.stage, options.stage));
	}

	if (scopeFilter) {
		filters.push(scopeFilter);
	}

	return db
		.select()
		.from(deal)
		.where(filters.length > 0 ? and(...filters) : undefined);
}

export async function listDealContactIds(dealId: string): Promise<string[]> {
	const rows = await db
		.select({ contactId: dealContact.contactId })
		.from(dealContact)
		.where(eq(dealContact.dealId, dealId));

	return rows.map((row) => row.contactId);
}
