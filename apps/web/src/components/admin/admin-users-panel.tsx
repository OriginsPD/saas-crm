import { Button } from "@portfolio-saas-crm/ui/components/button";
import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import { Plus } from "lucide-react";

import { CrmDataTable } from "@/components/data-table/crm-data-table";
import {
	getCrmRoleLabel,
	hasCrmPermission,
	type AdminUserRecord,
	type CrmRole,
} from "@/lib/crm-client";

type AdminUsersPanelProps = {
	users: AdminUserRecord[];
	teams: Array<{ id: string; name: string }>;
	permissions: readonly string[];
	onUpdateRole?: (
		user: AdminUserRecord,
		input: { role: CrmRole; teamId: string | null },
	) => void | Promise<void>;
	onUpdateStatus?: (
		user: AdminUserRecord,
		status: "active" | "disabled",
	) => void | Promise<void>;
};

export function AdminUsersPanel({
	users,
	teams,
	permissions,
	onUpdateRole,
	onUpdateStatus,
}: AdminUsersPanelProps) {
	const canManage = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"users.manage",
	);
	const canChangeRoles = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"users.change_roles",
	);
	const canDisable = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"users.disable",
	);

	return (
		<div className="space-y-6" data-testid="admin-users-panel">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-semibold text-2xl tracking-tight">Users</h1>
					<p className="max-w-2xl text-muted-foreground text-sm">
						Manage CRM roles, team membership, and account status.
					</p>
				</div>
				{canManage ? (
					<a href="/admin/users/new" className={buttonVariants()}>
						<Plus className="size-4" aria-hidden="true" />
						New user
					</a>
				) : null}
			</div>

			<CrmDataTable
				testId="admin-users-table"
				rows={users}
				searchPlaceholder="Search users"
				emptyTitle="No users found"
				emptyDescription="Create a user or adjust your search."
				getRowId={(user) => user.profileId}
				columns={[
					{
						id: "name",
						header: "User",
						searchValue: (user) => `${user.name} ${user.email}`,
						cell: (user) => (
							<div>
								<p className="font-medium">{user.name}</p>
								<p className="text-muted-foreground text-xs">{user.email}</p>
							</div>
						),
					},
					{
						id: "role",
						header: "Role",
						cell: (user) =>
							canChangeRoles ? (
								<select
									className="border-input bg-background flex h-9 rounded-md border px-2 text-sm"
									value={user.role}
									data-testid={`role-select-${user.profileId}`}
									onChange={(event) =>
										onUpdateRole?.(user, {
											role: event.target.value as CrmRole,
											teamId: user.teamId,
										})
									}
								>
									<option value="administrator">Administrator</option>
									<option value="sales_manager">Sales Manager</option>
									<option value="sales_representative">
										Sales Representative
									</option>
								</select>
							) : (
								getCrmRoleLabel(user.role)
							),
					},
					{
						id: "team",
						header: "Team",
						searchValue: (user) => user.teamName ?? "",
						cell: (user) =>
							canChangeRoles && user.role !== "administrator" ? (
								<select
									className="border-input bg-background flex h-9 rounded-md border px-2 text-sm"
									value={user.teamId ?? ""}
									data-testid={`team-select-${user.profileId}`}
									onChange={(event) =>
										onUpdateRole?.(user, {
											role: user.role,
											teamId: event.target.value || null,
										})
									}
								>
									<option value="">Select team</option>
									{teams.map((team) => (
										<option key={team.id} value={team.id}>
											{team.name}
										</option>
									))}
								</select>
							) : (
								(user.teamName ?? "—")
							),
					},
					{
						id: "status",
						header: "Status",
						cell: (user) => (
							<span className="inline-flex rounded-full border border-border/70 px-2 py-0.5 text-xs capitalize">
								{user.status}
							</span>
						),
					},
					{
						id: "actions",
						header: "Actions",
						cell: (user) =>
							canDisable ? (
								<Button
									size="sm"
									variant="outline"
									data-testid={`status-toggle-${user.profileId}`}
									onClick={() =>
										onUpdateStatus?.(
											user,
											user.status === "active" ? "disabled" : "active",
										)
									}
								>
									{user.status === "active" ? "Disable" : "Enable"}
								</Button>
							) : (
								"—"
							),
					},
				]}
			/>
		</div>
	);
}
