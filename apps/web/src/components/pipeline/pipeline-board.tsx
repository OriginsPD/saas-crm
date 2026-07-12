import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@portfolio-saas-crm/ui/components/empty";
import { cn } from "@portfolio-saas-crm/ui/lib/utils";
import { Handshake } from "lucide-react";

import { ScopeBadge } from "@/components/crm-records/record-badges";
import {
	DEAL_STAGES,
	formatDealValue,
	getDealStageLabel,
	type CrmViewScope,
	type DealRecord,
	type DealStage,
	type PipelineStageTotal,
} from "@/lib/crm-client";

type PipelineSummaryProps = {
	stages: PipelineStageTotal[];
	scope: CrmViewScope;
};

export function PipelineSummary({ stages, scope }: PipelineSummaryProps) {
	const openValueCents = stages
		.filter(
			(stage) => stage.stage !== "closed_won" && stage.stage !== "closed_lost",
		)
		.reduce((total, stage) => total + stage.totalValueCents, 0);
	const openDealCount = stages
		.filter(
			(stage) => stage.stage !== "closed_won" && stage.stage !== "closed_lost",
		)
		.reduce((total, stage) => total + stage.dealCount, 0);

	return (
		<div className="space-y-3" data-testid="pipeline-summary">
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="font-semibold text-2xl tracking-tight">Deal pipeline</h1>
				<ScopeBadge scope={scope} />
			</div>
			<p className="max-w-3xl text-muted-foreground text-sm">
				Open pipeline: {openDealCount} deals · {formatDealValue(openValueCents)}
			</p>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{stages.map((stage) => (
					<div
						key={stage.stage}
						className="rounded-lg border border-border/70 bg-card/50 px-4 py-3"
						data-testid={`pipeline-total-${stage.stage}`}
					>
						<p className="text-muted-foreground text-xs uppercase tracking-wide">
							{getDealStageLabel(stage.stage)}
						</p>
						<p className="mt-1 font-medium text-sm">
							{stage.dealCount} deals · {formatDealValue(stage.totalValueCents)}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

type PipelineBoardProps = {
	deals: DealRecord[];
	onSelectDeal?: (deal: DealRecord) => void;
	searchQuery?: string;
};

export function PipelineBoard({
	deals,
	onSelectDeal,
	searchQuery = "",
}: PipelineBoardProps) {
	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredDeals = normalizedQuery
		? deals.filter((deal) => deal.title.toLowerCase().includes(normalizedQuery))
		: deals;

	if (filteredDeals.length === 0) {
		return (
			<Empty
				className="border border-dashed border-border/70 bg-card/30"
				data-testid="pipeline-board-empty"
			>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Handshake aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>No deals in scope</EmptyTitle>
					<EmptyDescription>
						Create a deal or adjust your search to populate the pipeline.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div
			className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6"
			data-testid="pipeline-board"
		>
			{DEAL_STAGES.map((stage) => {
				const stageDeals = filteredDeals.filter((deal) => deal.stage === stage);

				return (
					<section
						key={stage}
						className="flex min-h-48 flex-col rounded-lg border border-border/70 bg-muted/10"
						data-testid={`pipeline-column-${stage}`}
					>
						<header className="border-border/60 border-b px-3 py-2">
							<p className="font-medium text-sm">{getDealStageLabel(stage)}</p>
							<p className="text-muted-foreground text-xs">
								{stageDeals.length} deals
							</p>
						</header>
						<ul className="flex flex-1 flex-col gap-2 p-2">
							{stageDeals.length === 0 ? (
								<li className="px-2 py-6 text-center text-muted-foreground text-xs">
									No deals
								</li>
							) : (
								stageDeals.map((deal) => (
									<li key={deal.id}>
										<button
											type="button"
											className={cn(
												"w-full rounded-md border border-border/60 bg-card px-3 py-2 text-left transition-colors hover:bg-card/80",
												onSelectDeal && "cursor-pointer",
											)}
											data-deal-id={deal.id}
											onClick={
												onSelectDeal ? () => onSelectDeal(deal) : undefined
											}
										>
											<p className="font-medium text-sm">{deal.title}</p>
											<p className="text-muted-foreground text-xs">
												{formatDealValue(deal.valueCents, deal.currency)} ·{" "}
												{deal.probability}%
											</p>
										</button>
									</li>
								))
							)}
						</ul>
					</section>
				);
			})}
		</div>
	);
}

export function DealStageBadge({ stage }: { stage: DealStage }) {
	return (
		<span className="inline-flex rounded-full border border-border/70 px-2 py-0.5 text-xs">
			{getDealStageLabel(stage)}
		</span>
	);
}
