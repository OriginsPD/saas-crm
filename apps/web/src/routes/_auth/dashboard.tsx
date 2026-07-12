import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { ReportSummaryCards } from "@/components/dashboard/report-summary-cards";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	CRM_ROLE_LABELS,
	getRoleScopeLabel,
	getVisibleNavItems,
} from "@/components/crm-shell/navigation";
import { fetchDashboardReports, hasCrmPermission } from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const crmProfile = useCrmProfileContext();
	const { profile } = crmProfile;
	const roleLabel = CRM_ROLE_LABELS[profile.role];
	const scopeLabel = getRoleScopeLabel(profile.role);
	const navItems = getVisibleNavItems(crmProfile.permissions);
	const canViewReports = hasCrmPermission(
		crmProfile.permissions,
		"reports.view",
	);
	const reportsState = useAsyncResource(
		() => (canViewReports ? fetchDashboardReports() : Promise.resolve(null)),
		[canViewReports],
	);

	if (reportsState.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (reportsState.status === "error") {
		return <RecordPageError message={reportsState.message} />;
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-6 p-4 md:p-6">
			<section className="space-y-2">
				<h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
				<p className="max-w-3xl text-muted-foreground text-sm">
					{roleLabel} workspace scoped to {scopeLabel.toLowerCase()}. Key
					metrics and navigation reflect your current permissions.
				</p>
			</section>

			{reportsState.data ? (
				<ReportSummaryCards
					scope={crmProfile.viewScopes.reports ?? "deny"}
					pipeline={reportsState.data.pipeline}
					performance={reportsState.data.performance}
					tasks={reportsState.data.tasks}
				/>
			) : null}

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{navItems.slice(0, 4).map((item) => (
					<Card key={item.id} className="border-border/70 bg-card/60">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">{item.label}</CardTitle>
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<Link
								to={item.href}
								className="text-primary text-sm hover:underline"
							>
								Open {item.label.toLowerCase()}
							</Link>
						</CardContent>
					</Card>
				))}
			</section>

			{canViewReports ? (
				<Card>
					<CardHeader>
						<CardTitle>Reporting</CardTitle>
						<CardDescription>
							Review scoped pipeline, task, and activity metrics with filters.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							to="/reports"
							className="text-primary text-sm hover:underline"
						>
							Open full reports
						</Link>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
