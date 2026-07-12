import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	fetchAdminUsers,
	hasCrmPermission,
	updateAdminUserRole,
	updateAdminUserStatus,
} from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/admin/users/")({
	component: AdminUsersIndexPage,
});

function AdminUsersIndexPage() {
	const crmProfile = useCrmProfileContext();
	const [refreshKey, setRefreshKey] = useState(0);
	const state = useAsyncResource(() => fetchAdminUsers(), [refreshKey]);

	if (!hasCrmPermission(crmProfile.permissions, "users.manage")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to manage users.
				</p>
			</div>
		);
	}

	if (state.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (state.status === "error") {
		return <RecordPageError message={state.message} />;
	}

	return (
		<div className="p-4 md:p-6">
			<AdminUsersPanel
				users={state.data.items}
				teams={state.data.teams}
				permissions={crmProfile.permissions}
				onUpdateRole={async (user, input) => {
					try {
						await updateAdminUserRole(user.profileId, input);
						toast.success("User role updated");
						setRefreshKey((value) => value + 1);
					} catch (error) {
						toast.error((error as Error).message);
					}
				}}
				onUpdateStatus={async (user, status) => {
					try {
						await updateAdminUserStatus(user.profileId, status);
						toast.success(
							status === "disabled" ? "User disabled" : "User enabled",
						);
						setRefreshKey((value) => value + 1);
					} catch (error) {
						toast.error((error as Error).message);
					}
				}}
			/>
		</div>
	);
}
