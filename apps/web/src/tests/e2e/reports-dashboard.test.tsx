import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import { ReportFiltersForm } from "@/components/dashboard/report-filters";
import { ReportSummaryCards } from "@/components/dashboard/report-summary-cards";
import { ReportsPanel } from "@/components/dashboard/reports-panel";
import { DEAL_STAGES } from "@/lib/crm-client";

const pipelineReport = {
	stages: DEAL_STAGES.map((stage) => ({
		stage,
		dealCount: stage === "negotiation" ? 2 : 0,
		totalValueCents: stage === "negotiation" ? 50000000 : 0,
	})),
	totalOpenValueCents: 50000000,
	totalOpenDeals: 2,
};

const performanceReport = {
	openDeals: 2,
	closedWonCount: 1,
	closedLostCount: 0,
	totalPipelineValueCents: 50000000,
	activityCount: 4,
};

const taskReport = {
	openCount: 3,
	completedCount: 2,
	overdueCount: 1,
};

describe("reports dashboard UI", () => {
	test("summary cards show scoped metrics", () => {
		render(
			<ReportSummaryCards
				scope="team_owned"
				pipeline={pipelineReport}
				performance={performanceReport}
				tasks={taskReport}
			/>,
		);

		expect(screen.getByTestId("report-summary-cards")).toBeTruthy();
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Team-owned records",
		);
		expect(screen.getByTestId("metric-open-pipeline-value").textContent).toBe(
			"$500,000",
		);
		expect(screen.getByTestId("metric-closed-won-count").textContent).toBe("1");
		expect(screen.getByTestId("metric-activity-count").textContent).toBe("4");
		expect(screen.getByTestId("metric-overdue-tasks").textContent).toBe("1");
	});

	test("reports panel renders filters and pipeline stages", () => {
		render(
			<ReportsPanel
				scope="all"
				pipeline={pipelineReport}
				performance={performanceReport}
				tasks={taskReport}
				showOwnerFilter
				onApplyFilters={async () => undefined}
			/>,
		);

		expect(screen.getByTestId("reports-panel")).toBeTruthy();
		expect(screen.getByTestId("report-filters-form")).toBeTruthy();
		expect(screen.getByTestId("pipeline-stage-negotiation")).toBeTruthy();
	});

	test("representative scope label shown on summary cards", () => {
		render(
			<ReportSummaryCards
				scope="own_assigned"
				pipeline={pipelineReport}
				performance={performanceReport}
				tasks={taskReport}
			/>,
		);

		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Assigned records",
		);
	});

	test("report filters form updates date values", () => {
		let currentFilters = {};

		render(
			<ReportFiltersForm
				filters={currentFilters}
				onChange={(filters) => {
					currentFilters = filters;
				}}
			/>,
		);

		fireEvent.change(screen.getByLabelText("From date"), {
			target: { value: "2026-07-01" },
		});

		expect(currentFilters).toMatchObject({ fromDate: "2026-07-01" });
	});
});
