import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { CompaniesListPanel } from "@/components/crm-records/companies-list-panel";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import { fetchCompanies } from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/companies/")({
	component: CompaniesIndexPage,
});

function CompaniesIndexPage() {
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const state = useAsyncResource(() => fetchCompanies(), []);

	if (state.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (state.status === "error") {
		return <RecordPageError message={state.message} />;
	}

	return (
		<div className="p-4 md:p-6">
			<CompaniesListPanel
				companies={state.data.items}
				scope={crmProfile.viewScopes.companies ?? "deny"}
				permissions={crmProfile.permissions}
				onSelectCompany={(company) => {
					void navigate({
						to: "/companies/$companyId",
						params: { companyId: company.id },
					});
				}}
			/>
		</div>
	);
}
