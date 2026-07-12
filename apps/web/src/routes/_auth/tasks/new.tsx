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
import { TaskForm } from "@/components/forms/task-form";
import {
	createTask,
	fetchCompanies,
	fetchDeals,
	hasCrmPermission,
	type CrmRequestError,
} from "@/lib/crm-client";

type TasksNewSearch = {
	companyId?: string;
	dealId?: string;
	contactId?: string;
};

export const Route = createFileRoute("/_auth/tasks/new")({
	component: NewTaskPage,
	validateSearch: (search: Record<string, unknown>): TasksNewSearch => ({
		companyId:
			typeof search.companyId === "string" ? search.companyId : undefined,
		dealId: typeof search.dealId === "string" ? search.dealId : undefined,
		contactId:
			typeof search.contactId === "string" ? search.contactId : undefined,
	}),
});

function NewTaskPage() {
	const { companyId, dealId, contactId } = Route.useSearch();
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const companiesState = useAsyncResource(() => fetchCompanies(), []);
	const dealsState = useAsyncResource(() => fetchDeals(), []);

	if (!hasCrmPermission(crmProfile.permissions, "tasks.create")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to create tasks.
				</p>
			</div>
		);
	}

	if (companiesState.status === "loading" || dealsState.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (companiesState.status === "error") {
		return <RecordPageError message={companiesState.message} />;
	}

	if (dealsState.status === "error") {
		return <RecordPageError message={dealsState.message} />;
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
			<div className="space-y-2">
				<Link
					to="/tasks"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					← Back to tasks
				</Link>
				<h1 className="font-semibold text-2xl tracking-tight">New task</h1>
				<p className="text-muted-foreground text-sm">
					Create a follow-up tied to your accounts or deals.
				</p>
				<ScopeBadge scope={crmProfile.viewScopes.tasks ?? "deny"} />
			</div>

			<TaskForm
				submitLabel="Create task"
				lockRelatedEntity={Boolean(companyId || dealId || contactId)}
				initialValues={{
					title: "",
					description: "",
					assigneeProfileId: crmProfile.profile.id,
					relatedCompanyId: companyId ?? "",
					relatedContactId: contactId ?? "",
					relatedDealId: dealId ?? "",
					dueDate: "",
					priority: "medium",
				}}
				companyOptions={companiesState.data.items.map((company) => ({
					id: company.id,
					name: company.name,
				}))}
				dealOptions={dealsState.data.items.map((deal) => ({
					id: deal.id,
					title: deal.title,
				}))}
				serverFieldErrors={fieldErrors}
				serverError={serverError}
				onSubmit={async (input) => {
					setFieldErrors(undefined);
					setServerError(undefined);

					try {
						await createTask(input);
						toast.success("Task created");
						await navigate({ to: "/tasks" });
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
