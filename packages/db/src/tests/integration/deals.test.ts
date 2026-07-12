import { describe, expect, test } from "bun:test";

import { type AuthorizationScope } from "../../authorization/scope";
import { buildDealListQuery } from "../../repositories/deals";

describe("deal repository scope integration", () => {
	test("manager without team gets denied deal query", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager",
			actorTeamId: null,
		};

		const query = buildDealListQuery(managerScope).toSQL();

		expect(query.sql).toContain("false");
	});

	test("pipeline list query can filter by stage", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const query = buildDealListQuery(adminScope, { stage: "proposal" }).toSQL();

		expect(query.sql).toContain("stage");
		expect(query.params).toContain("proposal");
	});
});
