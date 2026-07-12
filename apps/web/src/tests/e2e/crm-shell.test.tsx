import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

import { CrmShellNavPreview } from "@/components/crm-shell/crm-shell";
import {
	getRepresentativeHiddenNavIds,
	getVisibleNavItems,
} from "@/components/crm-shell/navigation";
import {
	CrmEmptyDashboardState,
	CrmPermissionDeniedState,
	CrmShellLoadingState,
} from "@/components/crm-shell/shell-states";
import type { CrmPermission } from "@/lib/crm-client";

const ADMIN_PERMISSIONS: CrmPermission[] = [
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
];

const MANAGER_PERMISSIONS: CrmPermission[] = [
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
];

const REPRESENTATIVE_PERMISSIONS: CrmPermission[] = [
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
];

describe("CRM shell navigation", () => {
	test("administrator sees users and teams navigation", () => {
		const navItems = getVisibleNavItems(ADMIN_PERMISSIONS);
		const navIds = navItems.map((item) => item.id);

		expect(navIds).toContain("users");
		expect(navIds).toContain("teams");
		expect(navIds).toContain("reports");
	});

	test("sales manager sees teams but not user administration", () => {
		const navItems = getVisibleNavItems(MANAGER_PERMISSIONS);
		const navIds = navItems.map((item) => item.id);

		expect(navIds).toContain("teams");
		expect(navIds).not.toContain("users");
	});

	test("sales representative hides admin-only navigation", () => {
		const navItems = getVisibleNavItems(REPRESENTATIVE_PERMISSIONS);
		const navIds = navItems.map((item) => item.id);

		for (const hiddenId of getRepresentativeHiddenNavIds()) {
			expect(navIds).not.toContain(hiddenId);
		}

		expect(navIds).toContain("deals");
		expect(navIds).toContain("tasks");
	});

	test("navigation preview renders role-specific items", () => {
		render(<CrmShellNavPreview permissions={REPRESENTATIVE_PERMISSIONS} />);

		expect(screen.getByTestId("crm-shell-nav")).toBeTruthy();
		expect(screen.getByText("Deals")).toBeTruthy();
		expect(screen.queryByText("Users")).toBeNull();
	});
});

describe("CRM shell states", () => {
	test("loading state exposes test hook", () => {
		render(<CrmShellLoadingState />);
		expect(screen.getByTestId("crm-shell-loading")).toBeTruthy();
	});

	test("permission denied state is accessible", () => {
		render(<CrmPermissionDeniedState />);
		expect(screen.getByTestId("crm-shell-permission-denied")).toBeTruthy();
		expect(screen.getByText("Access denied")).toBeTruthy();
	});

	test("empty dashboard state describes role scope", () => {
		render(
			<CrmEmptyDashboardState
				roleLabel="Sales Manager"
				scopeLabel="Team-owned records"
			/>,
		);

		expect(screen.getByTestId("crm-shell-empty")).toBeTruthy();
		expect(screen.getByText(/Sales Manager/i)).toBeTruthy();
		expect(screen.getByText(/Team-owned records/i)).toBeTruthy();
	});
});
