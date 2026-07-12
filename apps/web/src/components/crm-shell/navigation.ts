import type { LucideIcon } from "lucide-react";
import {
	Activity,
	BarChart3,
	Building2,
	ClipboardList,
	Contact,
	Handshake,
	LayoutDashboard,
	Users,
	UsersRound,
} from "lucide-react";

import type { CrmPermission } from "@/lib/crm-client";

export type CrmNavItem = {
	id: string;
	label: string;
	href: string;
	permission: CrmPermission;
	icon: LucideIcon;
	description: string;
};

export const CRM_NAV_ITEMS: CrmNavItem[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		href: "/dashboard",
		permission: "profile.view_own",
		icon: LayoutDashboard,
		description: "Pipeline health and daily priorities",
	},
	{
		id: "companies",
		label: "Companies",
		href: "/companies",
		permission: "companies.view",
		icon: Building2,
		description: "Accounts in your scope",
	},
	{
		id: "contacts",
		label: "Contacts",
		href: "/contacts",
		permission: "contacts.view",
		icon: Contact,
		description: "People tied to accounts",
	},
	{
		id: "deals",
		label: "Deals",
		href: "/deals",
		permission: "deals.view",
		icon: Handshake,
		description: "Pipeline stages and close dates",
	},
	{
		id: "tasks",
		label: "Tasks",
		href: "/tasks",
		permission: "tasks.view",
		icon: ClipboardList,
		description: "Follow-ups and assignments",
	},
	{
		id: "activity",
		label: "Activity",
		href: "/dashboard/activity",
		permission: "activity.view",
		icon: Activity,
		description: "Calls, notes, and meetings",
	},
	{
		id: "reports",
		label: "Reports",
		href: "/reports",
		permission: "reports.view",
		icon: BarChart3,
		description: "Performance and pipeline metrics",
	},
	{
		id: "teams",
		label: "Teams",
		href: "/dashboard/teams",
		permission: "teams.view",
		icon: UsersRound,
		description: "Team ownership and coverage",
	},
	{
		id: "users",
		label: "Users",
		href: "/admin/users",
		permission: "users.manage",
		icon: Users,
		description: "Roles, access, and account status",
	},
];

export const CRM_ROLE_LABELS = {
	administrator: "Administrator",
	sales_manager: "Sales Manager",
	sales_representative: "Sales Representative",
} as const;

export function getVisibleNavItems(
	permissions: readonly CrmPermission[],
): CrmNavItem[] {
	return CRM_NAV_ITEMS.filter((item) => permissions.includes(item.permission));
}

export function getRoleScopeLabel(role: keyof typeof CRM_ROLE_LABELS): string {
	switch (role) {
		case "administrator":
			return "All records";
		case "sales_manager":
			return "Team-owned records";
		case "sales_representative":
			return "Assigned records";
	}
}

export function getAdminOnlyNavIds(): string[] {
	return ["users"];
}

export function getManagerNavIds(): string[] {
	return ["teams", "reports"];
}

export function getRepresentativeHiddenNavIds(): string[] {
	return ["users", "teams"];
}
