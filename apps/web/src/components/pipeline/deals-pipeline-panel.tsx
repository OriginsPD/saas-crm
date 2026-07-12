import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Plus } from "lucide-react";
import { useState } from "react";

import {
	PipelineBoard,
	PipelineSummary,
} from "@/components/pipeline/pipeline-board";
import {
	hasCrmPermission,
	type CrmViewScope,
	type DealRecord,
	type PipelineStageTotal,
} from "@/lib/crm-client";

type DealsPipelinePanelProps = {
	deals: DealRecord[];
	stages: PipelineStageTotal[];
	scope: CrmViewScope;
	permissions: readonly string[];
	onSelectDeal?: (deal: DealRecord) => void;
};

export function DealsPipelinePanel({
	deals,
	stages,
	scope,
	permissions,
	onSelectDeal,
}: DealsPipelinePanelProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const canCreate = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"deals.create",
	);

	return (
		<div className="space-y-6" data-testid="deals-pipeline-panel">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<PipelineSummary stages={stages} scope={scope} />
				{canCreate ? (
					<a href="/deals/new" className={buttonVariants()}>
						<Plus className="size-4" aria-hidden="true" />
						New deal
					</a>
				) : null}
			</div>

			<div className="max-w-md">
				<Input
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					placeholder="Search deals"
					aria-label="Search deals"
					data-testid="pipeline-search"
				/>
			</div>

			<PipelineBoard
				deals={deals}
				searchQuery={searchQuery}
				onSelectDeal={onSelectDeal}
			/>
		</div>
	);
}
