import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { ReportsPanel } from "@/components/dashboard/reports-panel";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	fetchDashboardReports,
	hasCrmPermission,
	type CrmRequestError,
	type ReportFilters,
} from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/reports/")({
	component: ReportsIndexPage,
});

function ReportsIndexPage() {
	const crmProfile = useCrmProfileContext();
	const [filters, setFilters] = useState<ReportFilters>({});
	const [refreshKey, setRefreshKey] = useState(0);
	const state = useAsyncResource(
		() => fetchDashboardReports(filters),
		[filters.fromDate, filters.toDate, filters.ownerProfileId, refreshKey],
	);

	if (!hasCrmPermission(crmProfile.permissions, "reports.view")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to view reports.
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
			<ReportsPanel
				scope={crmProfile.viewScopes.reports ?? "deny"}
				pipeline={state.data.pipeline}
				performance={state.data.performance}
				tasks={state.data.tasks}
				showOwnerFilter={crmProfile.viewScopes.reports !== "own_assigned"}
				onApplyFilters={async (nextFilters) => {
					try {
						setFilters(nextFilters);
						setRefreshKey((value) => value + 1);
					} catch (error) {
						const requestError = error as CrmRequestError;
						toast.error(requestError.message);
					}
				}}
			/>
		</div>
	);
}
