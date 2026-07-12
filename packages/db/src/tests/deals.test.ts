import { describe, expect, test } from "bun:test";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";

import {
	canAccessOwnedRecord,
	type AuthorizationScope,
} from "../authorization/scope";
import {
	DEAL_STAGES,
	buildDealListQuery,
	validateDealInput,
	validateStageTransition,
} from "../repositories/deals";
import {
	company,
	crmProfile,
	deal,
	dealContact,
	dealStageEnum,
} from "../schema/crm";

describe("deal schema", () => {
	test("exports deal and deal_contact tables", () => {
		expect(is(deal, PgTable)).toBe(true);
		expect(is(dealContact, PgTable)).toBe(true);
		expect(getTableName(deal)).toBe("deal");
		expect(getTableName(dealContact)).toBe("deal_contact");
	});

	test("models deal stage enum from data model", () => {
		expect(dealStageEnum.enumValues).toEqual([
			"prospecting",
			"qualified",
			"proposal",
			"negotiation",
			"closed_won",
			"closed_lost",
		]);
		expect(DEAL_STAGES).toEqual(dealStageEnum.enumValues);
	});

	test("links deals to companies and CRM profiles", () => {
		const dealColumns = getTableColumns(deal);
		const dealForeignKeys = getTableConfig(deal).foreignKeys;

		expect(dealColumns.title.notNull).toBe(true);
		expect(dealColumns.valueCents.notNull).toBe(true);
		expect(dealColumns.currency.notNull).toBe(true);
		expect(dealColumns.probability.notNull).toBe(true);
		expect(
			dealForeignKeys.some(
				(foreignKey) => foreignKey.reference().foreignTable === company,
			),
		).toBe(true);
		expect(
			dealForeignKeys.some(
				(foreignKey) => foreignKey.reference().foreignTable === crmProfile,
			),
		).toBe(true);
	});
});

describe("deal validation", () => {
	test("rejects negative deal value", () => {
		const result = validateDealInput({
			companyId: "company-1",
			title: "Expansion",
			valueCents: -100,
			probability: 50,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.valueCents).toContain(
				"Deal value must be a non-negative integer.",
			);
		}
	});

	test("rejects probability outside 0-100", () => {
		const result = validateDealInput({
			companyId: "company-1",
			title: "Expansion",
			valueCents: 100000,
			probability: 120,
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.probability).toContain(
				"Probability must be between 0 and 100.",
			);
		}
	});

	test("accepts valid deal input", () => {
		const result = validateDealInput({
			companyId: "company-1",
			title: "Expansion",
			valueCents: 250000,
			probability: 40,
			expectedCloseDate: "2026-12-31",
		});

		expect(result.valid).toBe(true);
	});
});

describe("deal stage transitions", () => {
	test("closing deal requires expected close date", () => {
		const result = validateStageTransition(
			{
				stage: "negotiation",
				expectedCloseDate: null,
				closedAt: null,
				lossReason: null,
			},
			{ stage: "closed_won" },
		);

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.expectedCloseDate).toContain(
				"Expected close date is required before closing a deal.",
			);
		}
	});

	test("closed-lost requires loss reason", () => {
		const result = validateStageTransition(
			{
				stage: "negotiation",
				expectedCloseDate: "2026-12-31",
				closedAt: null,
				lossReason: null,
			},
			{ stage: "closed_lost" },
		);

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.lossReason).toContain(
				"Loss reason is required for closed-lost deals.",
			);
		}
	});

	test("valid close sets closedAt metadata", () => {
		const closedAt = new Date("2026-07-01T12:00:00.000Z");
		const result = validateStageTransition(
			{
				stage: "negotiation",
				expectedCloseDate: "2026-12-31",
				closedAt: null,
				lossReason: null,
			},
			{
				stage: "closed_won",
				closedAt,
			},
		);

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.stage).toBe("closed_won");
			expect(result.value.closedAt).toEqual(closedAt);
			expect(result.value.expectedCloseDate).toBe("2026-12-31");
		}
	});
});

describe("deal authorization scope helpers", () => {
	test("administrator deal query has no owner scope predicate", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const query = buildDealListQuery(adminScope).toSQL();

		expect(query.sql).not.toContain("false");
		expect(query.params).not.toContain("profile-admin");
	});

	test("representative deal query scopes to actor profile", () => {
		const representativeScope: AuthorizationScope = {
			access: "own_assigned",
			actorProfileId: "profile-rep",
			actorTeamId: "team-a",
		};

		const query = buildDealListQuery(representativeScope).toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.params).toContain("profile-rep");
	});

	test("cross-team deal access is denied for team scope", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager-a",
			actorTeamId: "team-a",
		};

		expect(canAccessOwnedRecord(managerScope, "profile-rep-b", "team-b")).toBe(
			false,
		);
		expect(canAccessOwnedRecord(managerScope, "profile-rep-a", "team-a")).toBe(
			true,
		);
	});
});
