import { describe, expect, test } from "bun:test";

import { type AuthorizationScope } from "../../authorization/scope";
import { buildActivityListQuery } from "../../repositories/activities";
import { buildTaskListQuery } from "../../repositories/tasks";

describe("task and activity repository scope integration", () => {
	test("manager without team gets denied task query", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager",
			actorTeamId: null,
		};

		const query = buildTaskListQuery(managerScope).toSQL();

		expect(query.sql).toContain("false");
	});

	test("task list query can filter by status", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const query = buildTaskListQuery(adminScope, { status: "open" }).toSQL();

		expect(query.sql).toContain("status");
		expect(query.params).toContain("open");
	});

	test("activity list query can filter by related deal", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const query = buildActivityListQuery(adminScope, {
			relatedDealId: "deal-1",
		}).toSQL();

		expect(query.sql).toContain("related_deal_id");
		expect(query.params).toContain("deal-1");
	});
});
