import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { getCrmRoleLabel, type CrmPermission } from "@/lib/crm-client";

const ADMIN_PERMISSIONS: CrmPermission[] = [
	"users.manage",
	"users.change_roles",
	"users.disable",
];

const sampleUser = {
	userId: "user-rep",
	profileId: "profile-rep",
	name: "Rep User",
	email: "rep@example.com",
	role: "sales_representative" as const,
	teamId: "team-a",
	teamName: "Team A",
	status: "active" as const,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("admin users UI", () => {
	test("admin panel lists users with management controls", () => {
		render(
			<AdminUsersPanel
				users={[sampleUser]}
				teams={[{ id: "team-a", name: "Team A" }]}
				permissions={ADMIN_PERMISSIONS}
				onUpdateRole={async () => undefined}
				onUpdateStatus={async () => undefined}
			/>,
		);

		expect(screen.getByTestId("admin-users-panel")).toBeTruthy();
		expect(screen.getByText("Rep User")).toBeTruthy();
		expect(screen.getByTestId("role-select-profile-rep")).toBeTruthy();
		expect(screen.getByTestId("team-select-profile-rep")).toBeTruthy();
		expect(screen.getByTestId("status-toggle-profile-rep")).toBeTruthy();
		expect(screen.getByText("New user")).toBeTruthy();
	});

	test("role select triggers update callback", () => {
		let updatedRole: string | null = null;

		render(
			<AdminUsersPanel
				users={[sampleUser]}
				teams={[{ id: "team-a", name: "Team A" }]}
				permissions={ADMIN_PERMISSIONS}
				onUpdateRole={async (_user, input) => {
					updatedRole = input.role;
				}}
			/>,
		);

		fireEvent.change(screen.getByTestId("role-select-profile-rep"), {
			target: { value: "sales_manager" },
		});

		expect(updatedRole).toBe("sales_manager");
	});

	test("disable action triggers status callback", () => {
		let nextStatus: string | null = null;

		render(
			<AdminUsersPanel
				users={[sampleUser]}
				teams={[{ id: "team-a", name: "Team A" }]}
				permissions={ADMIN_PERMISSIONS}
				onUpdateStatus={async (_user, status) => {
					nextStatus = status;
				}}
			/>,
		);

		fireEvent.click(screen.getByTestId("status-toggle-profile-rep"));

		expect(nextStatus).toBe("disabled");
	});

	test("role label helper maps CRM roles", () => {
		expect(getCrmRoleLabel("administrator")).toBe("Administrator");
		expect(getCrmRoleLabel("sales_manager")).toBe("Sales Manager");
	});
});
