import { describe, expect, test } from "bun:test";

import { type AuthorizationScope } from "../authorization/scope";
import {
	buildPipelineReportQuery,
	buildTaskReportQuery,
	validateReportFilters,
} from "../repositories/reports";

describe("report filter validation", () => {
	test("rejects end date before start date", () => {
		const result = validateReportFilters({
			fromDate: "2026-08-01",
			toDate: "2026-07-01",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.toDate).toContain(
				"End date must be on or after start date.",
			);
		}
	});

	test("accepts valid report filters", () => {
		const result = validateReportFilters({
			ownerProfileId: "profile-rep-a",
			fromDate: "2026-07-01",
			toDate: "2026-08-01",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.ownerProfileId).toBe("profile-rep-a");
		}
	});
});

describe("report authorization scope helpers", () => {
	test("administrator pipeline report query has no owner scope predicate", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const query = buildPipelineReportQuery(adminScope).toSQL();

		expect(query.sql).not.toContain("false");
		expect(query.params).not.toContain("profile-admin");
	});

	test("representative pipeline report query scopes to owner profile", () => {
		const representativeScope: AuthorizationScope = {
			access: "own_assigned",
			actorProfileId: "profile-rep",
			actorTeamId: "team-a",
		};

		const query = buildPipelineReportQuery(representativeScope).toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.params).toContain("profile-rep");
	});

	test("report owner filter adds predicate without bypassing scope", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager",
			actorTeamId: "team-a",
		};

		const query = buildPipelineReportQuery(managerScope, {
			ownerProfileId: "profile-rep-a",
		}).toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.params).toContain("profile-rep-a");
	});

	test("manager without team gets denied task report query", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager",
			actorTeamId: null,
		};

		const query = buildTaskReportQuery(managerScope).toSQL();

		expect(query.sql).toContain("false");
	});
});
