import { describe, expect, test } from "bun:test";

import { type AuthorizationScope } from "../../authorization/scope";
import { buildPipelineReportQuery } from "../../repositories/reports";

describe("report repository scope integration", () => {
	test("pipeline report query preserves representative scope", () => {
		const representativeScope: AuthorizationScope = {
			access: "own_assigned",
			actorProfileId: "profile-rep",
			actorTeamId: "team-a",
		};

		const query = buildPipelineReportQuery(representativeScope, {
			fromDate: "2026-07-01",
			toDate: "2026-08-01",
		}).toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.params).toContain("profile-rep");
	});
});
