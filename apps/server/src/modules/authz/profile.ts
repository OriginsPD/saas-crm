import {
	getRoleGrants,
	getViewScope,
	SCOPED_RESOURCES,
	type CrmPermission,
	type CrmRole,
} from "@portfolio-saas-crm/auth";
import {
	getCrmProfileByUserId,
	type CrmProfileRecord,
} from "@portfolio-saas-crm/db";

export type { CrmProfileRecord };

export type CrmMeResponse = {
	user: {
		id: string;
		name: string;
		email: string;
	};
	profile: {
		id: string;
		role: CrmRole;
		status: CrmProfileRecord["status"];
		teamId: string | null;
	};
	permissions: CrmPermission[];
	viewScopes: Record<
		(typeof SCOPED_RESOURCES)[number],
		ReturnType<typeof getViewScope>
	>;
};

export async function loadCrmProfileByUserId(
	userId: string,
): Promise<CrmProfileRecord | null> {
	return getCrmProfileByUserId(userId);
}

export function buildCrmMeResponse(
	user: { id: string; name: string; email: string },
	profile: CrmProfileRecord,
): CrmMeResponse {
	const role = profile.role as CrmRole;

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
		},
		profile: {
			id: profile.id,
			role,
			status: profile.status,
			teamId: profile.teamId,
		},
		permissions: [...getRoleGrants(role)],
		viewScopes: Object.fromEntries(
			SCOPED_RESOURCES.map((resource) => [
				resource,
				getViewScope(role, resource),
			]),
		) as CrmMeResponse["viewScopes"],
	};
}
