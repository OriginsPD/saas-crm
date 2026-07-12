import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import { DealForm, DealStageForm } from "@/components/forms/deal-form";
import { DealsPipelinePanel } from "@/components/pipeline/deals-pipeline-panel";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import { DEAL_STAGES, type CrmPermission } from "@/lib/crm-client";

const ADMIN_PERMISSIONS: CrmPermission[] = [
	"deals.view",
	"deals.create",
	"deals.edit",
	"deals.move_stage",
	"deals.close",
];

const sampleDeal = {
	id: "deal-1",
	companyId: "company-1",
	ownerProfileId: "profile-1",
	title: "Expansion",
	valueCents: 25000000,
	currency: "USD",
	stage: "negotiation" as const,
	probability: 60,
	expectedCloseDate: "2026-12-31",
	closedAt: null,
	lossReason: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

const pipelineStages = DEAL_STAGES.map((stage) => ({
	stage,
	dealCount: stage === "negotiation" ? 1 : 0,
	totalValueCents: stage === "negotiation" ? sampleDeal.valueCents : 0,
}));

describe("deals pipeline UI", () => {
	test("pipeline panel shows scope badge, totals, and board", () => {
		render(
			<DealsPipelinePanel
				deals={[sampleDeal]}
				stages={pipelineStages}
				scope="team_owned"
				permissions={ADMIN_PERMISSIONS}
			/>,
		);

		expect(screen.getByTestId("deals-pipeline-panel")).toBeTruthy();
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Team-owned records",
		);
		expect(screen.getByTestId("pipeline-total-negotiation")).toBeTruthy();
		expect(screen.getByTestId("pipeline-column-negotiation")).toBeTruthy();
		expect(screen.getByText("Expansion")).toBeTruthy();
	});

	test("pipeline search hides unmatched deals", () => {
		render(
			<DealsPipelinePanel
				deals={[sampleDeal]}
				stages={pipelineStages}
				scope="all"
				permissions={ADMIN_PERMISSIONS}
			/>,
		);

		fireEvent.change(screen.getByTestId("pipeline-search"), {
			target: { value: "missing-deal" },
		});

		expect(screen.getByTestId("pipeline-board-empty")).toBeTruthy();
	});

	test("deal form validates required title", async () => {
		render(
			<DealForm
				submitLabel="Create deal"
				initialValues={{
					companyId: "company-1",
					title: "",
					valueDollars: "1000",
					probability: "50",
					stage: "prospecting",
					expectedCloseDate: "",
				}}
				companyOptions={[{ id: "company-1", name: "Acme Corp" }]}
				onSubmit={async () => undefined}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Create deal" }));

		expect(await screen.findByText("Deal title is required.")).toBeTruthy();
	});

	test("stage form requires loss reason when closing lost", async () => {
		render(
			<DealStageForm
				currentStage="negotiation"
				expectedCloseDate="2026-12-31"
				submitLabel="Close deal"
				onSubmit={async () => undefined}
			/>,
		);

		fireEvent.change(screen.getByLabelText("Next stage"), {
			target: { value: "closed_lost" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Close deal" }));

		expect(
			await screen.findByText("Loss reason is required for closed-lost deals."),
		).toBeTruthy();
	});

	test("administrator pipeline includes create action", () => {
		render(
			<DealsPipelinePanel
				deals={[sampleDeal]}
				stages={pipelineStages}
				scope="all"
				permissions={ADMIN_PERMISSIONS}
			/>,
		);

		expect(screen.getByText("New deal")).toBeTruthy();
	});

	test("manager scope label visible on pipeline", () => {
		render(<ScopeBadge scope="team_owned" />);
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Team-owned records",
		);
	});
});
