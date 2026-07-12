import { getViewScope, type CrmRole } from "@portfolio-saas-crm/auth";
import type { AuthorizationScope } from "@portfolio-saas-crm/db";
import type { CrmProfileRecord } from "@portfolio-saas-crm/db";
import { status } from "elysia";

export function buildAuthorizationScope(
	profile: CrmProfileRecord,
	resource:
		| "companies"
		| "contacts"
		| "deals"
		| "tasks"
		| "activity"
		| "reports",
): AuthorizationScope {
	const access = getViewScope(profile.role as CrmRole, resource);

	if (access === "deny") {
		throw status(403, {
			code: "FORBIDDEN",
			message: `No access to ${resource}`,
		});
	}

	return {
		access,
		actorProfileId: profile.id,
		actorTeamId: profile.teamId,
	};
}
