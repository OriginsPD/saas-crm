export const CRM_ROLES = [
	"administrator",
	"sales_manager",
	"sales_representative",
] as const;

export type CrmRole = (typeof CRM_ROLES)[number];

export const ACCESS_SCOPES = ["all", "team_owned", "own_assigned"] as const;

export type AccessScope = (typeof ACCESS_SCOPES)[number];

export const CRM_PERMISSIONS = [
	"auth.sign_in_out",
	"profile.view_own",
	"users.manage",
	"users.change_roles",
	"users.disable",
	"teams.view",
	"teams.manage",
	"companies.view",
	"companies.create",
	"companies.edit",
	"companies.archive",
	"contacts.view",
	"contacts.create",
	"contacts.edit",
	"contacts.archive",
	"deals.view",
	"deals.create",
	"deals.edit",
	"deals.move_stage",
	"deals.close",
	"tasks.view",
	"tasks.create",
	"tasks.complete",
	"activity.view",
	"activity.create",
	"reports.view",
	"reports.export",
] as const;

export type CrmPermission = (typeof CRM_PERMISSIONS)[number];

export const SCOPED_RESOURCES = [
	"teams",
	"companies",
	"contacts",
	"deals",
	"tasks",
	"activity",
	"reports",
] as const;

export type ScopedResource = (typeof SCOPED_RESOURCES)[number];

const ROLE_GRANTS: Record<CrmRole, readonly CrmPermission[]> = {
	administrator: CRM_PERMISSIONS,
	sales_manager: [
		"auth.sign_in_out",
		"profile.view_own",
		"teams.view",
		"companies.view",
		"companies.create",
		"companies.edit",
		"companies.archive",
		"contacts.view",
		"contacts.create",
		"contacts.edit",
		"contacts.archive",
		"deals.view",
		"deals.create",
		"deals.edit",
		"deals.move_stage",
		"deals.close",
		"tasks.view",
		"tasks.create",
		"tasks.complete",
		"activity.view",
		"activity.create",
		"reports.view",
		"reports.export",
	],
	sales_representative: [
		"auth.sign_in_out",
		"profile.view_own",
		"companies.view",
		"companies.create",
		"companies.edit",
		"companies.archive",
		"contacts.view",
		"contacts.create",
		"contacts.edit",
		"contacts.archive",
		"deals.view",
		"deals.create",
		"deals.edit",
		"deals.move_stage",
		"deals.close",
		"tasks.view",
		"tasks.create",
		"tasks.complete",
		"activity.view",
		"activity.create",
		"reports.view",
	],
};

const RESOURCE_VIEW_SCOPE: Record<
	CrmRole,
	Partial<Record<ScopedResource, AccessScope | "deny">>
> = {
	administrator: {
		teams: "all",
		companies: "all",
		contacts: "all",
		deals: "all",
		tasks: "all",
		activity: "all",
		reports: "all",
	},
	sales_manager: {
		teams: "team_owned",
		companies: "team_owned",
		contacts: "team_owned",
		deals: "team_owned",
		tasks: "team_owned",
		activity: "team_owned",
		reports: "team_owned",
	},
	sales_representative: {
		teams: "deny",
		companies: "own_assigned",
		contacts: "own_assigned",
		deals: "own_assigned",
		tasks: "own_assigned",
		activity: "own_assigned",
		reports: "own_assigned",
	},
};

export interface ScopeContext {
	actorProfileId: string;
	actorTeamId: string | null;
	ownerProfileId?: string | null;
	ownerTeamId?: string | null;
	assigneeProfileId?: string | null;
	createdByProfileId?: string | null;
}

export function getRoleGrants(role: CrmRole): readonly CrmPermission[] {
	return ROLE_GRANTS[role];
}

export function hasPermission(
	role: CrmRole,
	permission: CrmPermission,
): boolean {
	return ROLE_GRANTS[role].includes(permission);
}

export function canAccess(role: CrmRole, permission: CrmPermission): boolean {
	return hasPermission(role, permission);
}

export function getViewScope(
	role: CrmRole,
	resource: ScopedResource,
): AccessScope | "deny" {
	return RESOURCE_VIEW_SCOPE[role][resource] ?? "deny";
}

export function isAccessScope(value: string): value is AccessScope {
	return ACCESS_SCOPES.includes(value as AccessScope);
}

export function matchesAccessScope(
	scope: AccessScope,
	context: ScopeContext,
): boolean {
	switch (scope) {
		case "all":
			return true;
		case "team_owned":
			if (!context.actorTeamId) {
				return false;
			}

			return context.ownerTeamId === context.actorTeamId;
		case "own_assigned":
			return (
				context.ownerProfileId === context.actorProfileId ||
				context.assigneeProfileId === context.actorProfileId ||
				context.createdByProfileId === context.actorProfileId
			);
	}
}

export function canViewResource(
	role: CrmRole,
	resource: ScopedResource,
	context: ScopeContext,
): boolean {
	const viewPermission = `${resource}.view` as CrmPermission;

	if (!hasPermission(role, viewPermission)) {
		return false;
	}

	const scope = getViewScope(role, resource);

	if (scope === "deny") {
		return false;
	}

	return matchesAccessScope(scope, context);
}
