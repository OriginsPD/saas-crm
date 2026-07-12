import { eq, inArray, sql, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm/column";

import { db } from "../index";
import { crmProfile } from "../schema/crm";

export type AuthorizationScope = {
	access: "all" | "team_owned" | "own_assigned";
	actorProfileId: string;
	actorTeamId: string | null;
};

export function buildOwnerScopeFilter(
	scope: AuthorizationScope,
	ownerProfileIdColumn: AnyColumn,
): SQL | undefined {
	switch (scope.access) {
		case "all":
			return undefined;
		case "own_assigned":
			return eq(ownerProfileIdColumn, scope.actorProfileId);
		case "team_owned":
			if (!scope.actorTeamId) {
				return sql`false`;
			}

			return inArray(
				ownerProfileIdColumn,
				db
					.select({ id: crmProfile.id })
					.from(crmProfile)
					.where(eq(crmProfile.teamId, scope.actorTeamId)),
			);
	}
}

export function canAccessOwnedRecord(
	scope: AuthorizationScope,
	ownerProfileId: string,
	ownerTeamId: string | null,
): boolean {
	switch (scope.access) {
		case "all":
			return true;
		case "own_assigned":
			return ownerProfileId === scope.actorProfileId;
		case "team_owned":
			return (
				ownerProfileId === scope.actorProfileId ||
				(scope.actorTeamId !== null && ownerTeamId === scope.actorTeamId)
			);
	}
}
