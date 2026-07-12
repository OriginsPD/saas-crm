import { Button } from "@portfolio-saas-crm/ui/components/button";
import { useState } from "react";

import { ReportFiltersForm } from "@/components/dashboard/report-filters";
import { ReportSummaryCards } from "@/components/dashboard/report-summary-cards";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import type {
	CrmViewScope,
	PerformanceReport,
	PipelineReport,
	ReportFilters,
	TaskReport,
} from "@/lib/crm-client";

type ReportsPanelProps = {
	scope: CrmViewScope;
	pipeline: PipelineReport;
	performance: PerformanceReport;
	tasks: TaskReport;
	showOwnerFilter?: boolean;
	onApplyFilters?: (filters: ReportFilters) => void | Promise<void>;
};

export function ReportsPanel({
	scope,
	pipeline,
	performance,
	tasks,
	showOwnerFilter = false,
	onApplyFilters,
}: ReportsPanelProps) {
	const [filters, setFilters] = useState<ReportFilters>({});

	return (
		<div className="space-y-6" data-testid="reports-panel">
			<div className="space-y-2">
				<h1 className="font-semibold text-2xl tracking-tight">Reports</h1>
				<p className="max-w-2xl text-muted-foreground text-sm">
					Pipeline, task, and activity metrics scoped to your role.
				</p>
				<ScopeBadge scope={scope} />
			</div>

			<div className="space-y-4 rounded-lg border p-4">
				<h2 className="font-medium text-sm">Filters</h2>
				<ReportFiltersForm
					filters={filters}
					onChange={setFilters}
					showOwnerFilter={showOwnerFilter}
				/>
				<Button
					variant="outline"
					data-testid="apply-report-filters"
					onClick={() => onApplyFilters?.(filters)}
				>
					Apply filters
				</Button>
			</div>

			<ReportSummaryCards
				scope={scope}
				pipeline={pipeline}
				performance={performance}
				tasks={tasks}
			/>
		</div>
	);
}
