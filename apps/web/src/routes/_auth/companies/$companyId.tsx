import {
	Button,
	buttonVariants,
} from "@portfolio-saas-crm/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import {
	ScopeBadge,
	StatusBadge,
} from "@/components/crm-records/record-badges";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	CompanyForm,
	companyRecordToFormValues,
} from "@/components/forms/company-form";
import {
	archiveCompany,
	fetchActivities,
	fetchCompany,
	fetchTasks,
	hasCrmPermission,
	updateCompany,
	type CrmRequestError,
} from "@/lib/crm-client";
import { EntityTimelinePanel } from "@/components/activity/entity-timeline-panel";

export const Route = createFileRoute("/_auth/companies/$companyId")({
	component: CompanyDetailPage,
});

function CompanyDetailPage() {
	const { companyId } = Route.useParams();
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const [isEditing, setIsEditing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const state = useAsyncResource(
		() => fetchCompany(companyId),
		[companyId, refreshKey],
	);
	const timelineState = useAsyncResource(async () => {
		const [activities, tasks] = await Promise.all([
			fetchActivities({ relatedCompanyId: companyId }),
			fetchTasks({ relatedCompanyId: companyId }),
		]);

		return {
			activities: activities.items,
			tasks: tasks.items,
		};
	}, [companyId, refreshKey]);

	const canEdit = hasCrmPermission(crmProfile.permissions, "companies.edit");
	const canArchive = hasCrmPermission(
		crmProfile.permissions,
		"companies.archive",
	);

	if (state.status === "loading" || timelineState.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (state.status === "error") {
		return <RecordPageError message={state.message} />;
	}

	if (timelineState.status === "error") {
		return <RecordPageError message={timelineState.message} />;
	}

	const company = state.data;

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<Link
						to="/companies"
						className="text-muted-foreground text-sm hover:text-foreground"
					>
						← Back to companies
					</Link>
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="font-semibold text-2xl tracking-tight">
							{company.name}
						</h1>
						<StatusBadge status={company.status} />
					</div>
					<p className="text-muted-foreground text-sm">
						{company.domain ?? "No domain"} ·{" "}
						{company.industry ?? "No industry"}
					</p>
					<ScopeBadge scope={crmProfile.viewScopes.companies ?? "deny"} />
				</div>

				<div className="flex flex-wrap gap-2">
					{canEdit ? (
						<Button
							variant="outline"
							onClick={() => {
								setIsEditing((value) => !value);
								setFieldErrors(undefined);
								setServerError(undefined);
							}}
						>
							{isEditing ? "Cancel edit" : "Edit company"}
						</Button>
					) : null}
					{canArchive && company.status !== "archived" ? (
						<Button
							variant="destructive"
							onClick={async () => {
								try {
									await archiveCompany(company.id);
									toast.success("Company archived");
									await navigate({ to: "/companies" });
								} catch (error) {
									toast.error((error as Error).message);
								}
							}}
							data-testid="archive-company-button"
						>
							Archive
						</Button>
					) : null}
				</div>
			</div>

			{isEditing && canEdit ? (
				<Card>
					<CardHeader>
						<CardTitle>Edit company</CardTitle>
					</CardHeader>
					<CardContent>
						<CompanyForm
							initialValues={companyRecordToFormValues(company)}
							submitLabel="Save company"
							serverFieldErrors={fieldErrors}
							serverError={serverError}
							onSubmit={async (input) => {
								setFieldErrors(undefined);
								setServerError(undefined);

								try {
									await updateCompany(company.id, input);
									toast.success("Company updated");
									setIsEditing(false);
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
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Company details</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm md:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-xs uppercase">Size</p>
							<p>{company.size?.replace("_", " ") ?? "—"}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">Notes</p>
							<p>{company.notes ?? "—"}</p>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Contacts</CardTitle>
					{hasCrmPermission(crmProfile.permissions, "contacts.create") ? (
						<Link
							to="/contacts/new"
							search={{ companyId: company.id }}
							className={buttonVariants({ size: "sm", variant: "outline" })}
						>
							Add contact
						</Link>
					) : null}
				</CardHeader>
				<CardContent>
					{company.contacts.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No contacts linked to this company yet.
						</p>
					) : (
						<ul className="space-y-2">
							{company.contacts.map((contact) => (
								<li key={contact.id}>
									<Link
										to="/contacts/$contactId"
										params={{ contactId: contact.id }}
										className="text-sm hover:underline"
									>
										{contact.firstName} {contact.lastName}
									</Link>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<EntityTimelinePanel
				activities={timelineState.data.activities}
				tasks={timelineState.data.tasks}
				permissions={crmProfile.permissions}
				relatedCompanyId={company.id}
				onActivityLogged={async () => {
					setRefreshKey((value) => value + 1);
				}}
			/>
		</div>
	);
}
