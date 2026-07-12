import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";

import { ScopeBadge } from "@/components/crm-records/record-badges";
import {
	formatDealValue,
	getDealStageLabel,
	type CrmViewScope,
	type PerformanceReport,
	type PipelineReport,
	type TaskReport,
} from "@/lib/crm-client";

type ReportSummaryCardsProps = {
	scope: CrmViewScope;
	pipeline: PipelineReport;
	performance: PerformanceReport;
	tasks: TaskReport;
};

export function ReportSummaryCards({
	scope,
	pipeline,
	performance,
	tasks,
}: ReportSummaryCardsProps) {
	return (
		<div className="space-y-6" data-testid="report-summary-cards">
			<div className="space-y-2">
				<h2 className="font-semibold text-xl tracking-tight">
					Performance summary
				</h2>
				<ScopeBadge scope={scope} />
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm">Open pipeline</CardTitle>
					</CardHeader>
					<CardContent>
						<p
							className="font-semibold text-2xl"
							data-testid="metric-open-pipeline-value"
						>
							{formatDealValue(pipeline.totalOpenValueCents)}
						</p>
						<p className="text-muted-foreground text-xs">
							{pipeline.totalOpenDeals} open deals
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm">Closed won</CardTitle>
					</CardHeader>
					<CardContent>
						<p
							className="font-semibold text-2xl"
							data-testid="metric-closed-won-count"
						>
							{performance.closedWonCount}
						</p>
						<p className="text-muted-foreground text-xs">
							Wins in selected range
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm">Activity volume</CardTitle>
					</CardHeader>
					<CardContent>
						<p
							className="font-semibold text-2xl"
							data-testid="metric-activity-count"
						>
							{performance.activityCount}
						</p>
						<p className="text-muted-foreground text-xs">Logged activities</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm">Task pressure</CardTitle>
					</CardHeader>
					<CardContent>
						<p
							className="font-semibold text-2xl"
							data-testid="metric-overdue-tasks"
						>
							{tasks.overdueCount}
						</p>
						<p className="text-muted-foreground text-xs">
							{tasks.openCount} open · {tasks.completedCount} completed
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Pipeline by stage</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{pipeline.stages.map((stage) => (
						<div
							key={stage.stage}
							className="rounded-lg border p-3"
							data-testid={`pipeline-stage-${stage.stage}`}
						>
							<p className="font-medium text-sm">
								{getDealStageLabel(stage.stage)}
							</p>
							<p className="text-muted-foreground text-xs">
								{stage.dealCount} deals ·{" "}
								{formatDealValue(stage.totalValueCents)}
							</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
