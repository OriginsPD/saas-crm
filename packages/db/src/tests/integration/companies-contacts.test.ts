import { describe, expect, test } from "bun:test";

import {
	canAccessOwnedRecord,
	type AuthorizationScope,
} from "../../authorization/scope";
import { buildCompanyListQuery } from "../../repositories/companies";
import { buildContactListQuery } from "../../repositories/contacts";

describe("company and contact repository scope integration", () => {
	test("administrator query has no owner scope predicate", () => {
		const adminScope: AuthorizationScope = {
			access: "all",
			actorProfileId: "profile-admin",
			actorTeamId: null,
		};

		const companyQuery = buildCompanyListQuery(adminScope).toSQL();
		const contactQuery = buildContactListQuery(adminScope).toSQL();

		expect(companyQuery.sql).not.toContain("false");
		expect(contactQuery.sql).not.toContain("false");
		expect(companyQuery.params).not.toContain("profile-admin");
	});

	test("manager without team gets denied company query", () => {
		const managerScope: AuthorizationScope = {
			access: "team_owned",
			actorProfileId: "profile-manager",
			actorTeamId: null,
		};

		const query = buildCompanyListQuery(managerScope).toSQL();

		expect(query.sql).toContain("false");
	});

	test("representative contact query scopes to actor profile", () => {
		const representativeScope: AuthorizationScope = {
			access: "own_assigned",
			actorProfileId: "profile-rep",
			actorTeamId: "team-a",
		};

		const query = buildContactListQuery(representativeScope).toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.params).toContain("profile-rep");
	});

	test("cross-team record access is denied for team scope", () => {
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
