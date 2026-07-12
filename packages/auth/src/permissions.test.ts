import { describe, expect, test } from "bun:test";

import {
	canAccess,
	canViewResource,
	CRM_PERMISSIONS,
	getRoleGrants,
	getViewScope,
	hasPermission,
	matchesAccessScope,
	type CrmPermission,
	type CrmRole,
} from "./permissions";

describe("CRM permissions", () => {
	test("administrator receives full grant set", () => {
		expect(getRoleGrants("administrator")).toHaveLength(CRM_PERMISSIONS.length);
		expect(hasPermission("administrator", "users.manage")).toBe(true);
		expect(hasPermission("administrator", "reports.export")).toBe(true);
	});

	test("sales manager cannot manage users or teams", () => {
		expect(hasPermission("sales_manager", "users.manage")).toBe(false);
		expect(hasPermission("sales_manager", "users.change_roles")).toBe(false);
		expect(hasPermission("sales_manager", "teams.manage")).toBe(false);
		expect(hasPermission("sales_manager", "reports.export")).toBe(true);
	});

	test("sales representative cannot export reports or view teams", () => {
		expect(hasPermission("sales_representative", "reports.export")).toBe(false);
		expect(getViewScope("sales_representative", "teams")).toBe("deny");
	});

	test("defaults to deny for unknown permission checks", () => {
		expect(
			canAccess("sales_representative", "users.manage" as CrmPermission),
		).toBe(false);
		expect(hasPermission("sales_manager", "teams.manage")).toBe(false);
	});

	test("scope helpers distinguish all, team-owned, and own/assigned access", () => {
		expect(getViewScope("administrator", "deals")).toBe("all");
		expect(getViewScope("sales_manager", "deals")).toBe("team_owned");
		expect(getViewScope("sales_representative", "deals")).toBe("own_assigned");

		expect(
			matchesAccessScope("all", {
				actorProfileId: "profile-a",
				actorTeamId: "team-a",
				ownerProfileId: "profile-b",
			}),
		).toBe(true);

		expect(
			matchesAccessScope("team_owned", {
				actorProfileId: "manager-a",
				actorTeamId: "team-a",
				ownerProfileId: "rep-a",
				ownerTeamId: "team-a",
			}),
		).toBe(true);

		expect(
			matchesAccessScope("team_owned", {
				actorProfileId: "manager-a",
				actorTeamId: "team-a",
				ownerProfileId: "rep-b",
				ownerTeamId: "team-b",
			}),
		).toBe(false);

		expect(
			matchesAccessScope("own_assigned", {
				actorProfileId: "rep-a",
				actorTeamId: "team-a",
				ownerProfileId: "rep-a",
			}),
		).toBe(true);

		expect(
			matchesAccessScope("own_assigned", {
				actorProfileId: "rep-a",
				actorTeamId: "team-a",
				assigneeProfileId: "rep-a",
			}),
		).toBe(true);

		expect(
			matchesAccessScope("own_assigned", {
				actorProfileId: "rep-a",
				actorTeamId: "team-a",
				ownerProfileId: "rep-b",
			}),
		).toBe(false);
	});

	test("canViewResource enforces permission and scope together", () => {
		const ownDealContext = {
			actorProfileId: "rep-a",
			actorTeamId: "team-a",
			ownerProfileId: "rep-a",
			ownerTeamId: "team-a",
		};
		const foreignDealContext = {
			actorProfileId: "rep-a",
			actorTeamId: "team-a",
			ownerProfileId: "rep-b",
			ownerTeamId: "team-b",
		};

		expect(
			canViewResource("sales_representative", "deals", ownDealContext),
		).toBe(true);
		expect(
			canViewResource("sales_representative", "deals", foreignDealContext),
		).toBe(false);
		expect(canViewResource("administrator", "deals", foreignDealContext)).toBe(
			true,
		);
	});

	test("matrix spot checks per role", () => {
		const cases: Array<[CrmRole, CrmPermission, boolean]> = [
			["administrator", "users.disable", true],
			["sales_manager", "deals.move_stage", true],
			["sales_manager", "users.disable", false],
			["sales_representative", "deals.create", true],
			["sales_representative", "tasks.complete", true],
			["sales_representative", "teams.view", false],
		];

		for (const [role, permission, expected] of cases) {
			expect(hasPermission(role, permission)).toBe(expected);
		}
	});
});
