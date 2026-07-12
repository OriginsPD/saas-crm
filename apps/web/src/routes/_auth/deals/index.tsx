import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import { DealsPipelinePanel } from "@/components/pipeline/deals-pipeline-panel";
import { fetchDealPipeline, fetchDeals } from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/deals/")({
	component: DealsIndexPage,
});

function DealsIndexPage() {
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const dealsState = useAsyncResource(() => fetchDeals(), []);
	const pipelineState = useAsyncResource(() => fetchDealPipeline(), []);

	if (dealsState.status === "loading" || pipelineState.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (dealsState.status === "error") {
		return <RecordPageError message={dealsState.message} />;
	}

	if (pipelineState.status === "error") {
		return <RecordPageError message={pipelineState.message} />;
	}

	return (
		<div className="p-4 md:p-6">
			<DealsPipelinePanel
				deals={dealsState.data.items}
				stages={pipelineState.data.stages}
				scope={crmProfile.viewScopes.deals ?? "deny"}
				permissions={crmProfile.permissions}
				onSelectDeal={(deal) => {
					void navigate({
						to: "/deals/$dealId",
						params: { dealId: deal.id },
					});
				}}
			/>
		</div>
	);
}
