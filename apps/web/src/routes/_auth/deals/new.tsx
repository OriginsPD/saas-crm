import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import { DealForm } from "@/components/forms/deal-form";
import {
	createDeal,
	fetchCompanies,
	hasCrmPermission,
	type CrmRequestError,
} from "@/lib/crm-client";

type DealsNewSearch = {
	companyId?: string;
};

export const Route = createFileRoute("/_auth/deals/new")({
	component: NewDealPage,
	validateSearch: (search: Record<string, unknown>): DealsNewSearch => ({
		companyId:
			typeof search.companyId === "string" ? search.companyId : undefined,
	}),
});

function NewDealPage() {
	const { companyId } = Route.useSearch();
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const companiesState = useAsyncResource(() => fetchCompanies(), []);

	if (!hasCrmPermission(crmProfile.permissions, "deals.create")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to create deals.
				</p>
			</div>
		);
	}

	if (companiesState.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (companiesState.status === "error") {
		return <RecordPageError message={companiesState.message} />;
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
			<div className="space-y-2">
				<Link
					to="/deals"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					← Back to pipeline
				</Link>
				<h1 className="font-semibold text-2xl tracking-tight">New deal</h1>
				<p className="text-muted-foreground text-sm">
					Add an opportunity to your scoped pipeline.
				</p>
				<ScopeBadge scope={crmProfile.viewScopes.deals ?? "deny"} />
			</div>

			<DealForm
				submitLabel="Create deal"
				lockCompany={Boolean(companyId)}
				initialValues={{
					companyId: companyId ?? "",
					title: "",
					valueDollars: "",
					probability: "25",
					stage: "prospecting",
					expectedCloseDate: "",
				}}
				companyOptions={companiesState.data.items.map((company) => ({
					id: company.id,
					name: company.name,
				}))}
				serverFieldErrors={fieldErrors}
				serverError={serverError}
				onSubmit={async (input) => {
					setFieldErrors(undefined);
					setServerError(undefined);

					try {
						const deal = await createDeal(input);
						toast.success("Deal created");
						await navigate({
							to: "/deals/$dealId",
							params: { dealId: deal.id },
						});
					} catch (error) {
						const requestError = error as CrmRequestError;

						if (requestError.fieldErrors) {
							setFieldErrors(requestError.fieldErrors);
							return;
						}

						setServerError(requestError.message);
					}
				}}
			/>
		</div>
	);
}
