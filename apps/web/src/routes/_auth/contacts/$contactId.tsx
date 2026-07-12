import { Button } from "@portfolio-saas-crm/ui/components/button";
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
	ContactForm,
	contactRecordToFormValues,
} from "@/components/forms/contact-form";
import {
	archiveContact,
	fetchActivities,
	fetchCompanies,
	fetchContact,
	fetchTasks,
	hasCrmPermission,
	updateContact,
	type CrmRequestError,
} from "@/lib/crm-client";
import { EntityTimelinePanel } from "@/components/activity/entity-timeline-panel";

export const Route = createFileRoute("/_auth/contacts/$contactId")({
	component: ContactDetailPage,
});

function ContactDetailPage() {
	const { contactId } = Route.useParams();
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const [isEditing, setIsEditing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const contactState = useAsyncResource(
		() => fetchContact(contactId),
		[contactId, refreshKey],
	);
	const companiesState = useAsyncResource(() => fetchCompanies(), []);
	const timelineState = useAsyncResource(async () => {
		const [activities, tasks] = await Promise.all([
			fetchActivities({ relatedContactId: contactId }),
			fetchTasks({ relatedContactId: contactId }),
		]);

		return {
			activities: activities.items,
			tasks: tasks.items,
		};
	}, [contactId, refreshKey]);

	const canEdit = hasCrmPermission(crmProfile.permissions, "contacts.edit");
	const canArchive = hasCrmPermission(
		crmProfile.permissions,
		"contacts.archive",
	);

	if (
		contactState.status === "loading" ||
		companiesState.status === "loading" ||
		timelineState.status === "loading"
	) {
		return <RecordPageLoadingState />;
	}

	if (contactState.status === "error") {
		return <RecordPageError message={contactState.message} />;
	}

	if (companiesState.status === "error") {
		return <RecordPageError message={companiesState.message} />;
	}

	if (timelineState.status === "error") {
		return <RecordPageError message={timelineState.message} />;
	}

	const contact = contactState.data;

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<Link
						to="/contacts"
						className="text-muted-foreground text-sm hover:text-foreground"
					>
						← Back to contacts
					</Link>
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="font-semibold text-2xl tracking-tight">
							{contact.firstName} {contact.lastName}
						</h1>
						<StatusBadge
							status={contact.status === "archived" ? "archived" : "active"}
						/>
					</div>
					<p className="text-muted-foreground text-sm">
						{contact.title ?? "No title"} ·{" "}
						{contact.email ?? contact.phone ?? "No contact info"}
					</p>
					<ScopeBadge scope={crmProfile.viewScopes.contacts ?? "deny"} />
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
							{isEditing ? "Cancel edit" : "Edit contact"}
						</Button>
					) : null}
					{canArchive && contact.status !== "archived" ? (
						<Button
							variant="destructive"
							onClick={async () => {
								try {
									await archiveContact(contact.id);
									toast.success("Contact archived");
									await navigate({ to: "/contacts" });
								} catch (error) {
									toast.error((error as Error).message);
								}
							}}
							data-testid="archive-contact-button"
						>
							Archive
						</Button>
					) : null}
				</div>
			</div>

			{isEditing && canEdit ? (
				<Card>
					<CardHeader>
						<CardTitle>Edit contact</CardTitle>
					</CardHeader>
					<CardContent>
						<ContactForm
							initialValues={contactRecordToFormValues(contact)}
							submitLabel="Save contact"
							lockCompany
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
									await updateContact(contact.id, input);
									toast.success("Contact updated");
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
						<CardTitle>Contact details</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm md:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-xs uppercase">Email</p>
							<p>{contact.email ?? "—"}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">Phone</p>
							<p>{contact.phone ?? "—"}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">Company</p>
							<Link
								to="/companies/$companyId"
								params={{ companyId: contact.companyId }}
								className="hover:underline"
							>
								View company
							</Link>
						</div>
					</CardContent>
				</Card>
			)}

			<EntityTimelinePanel
				activities={timelineState.data.activities}
				tasks={timelineState.data.tasks}
				permissions={crmProfile.permissions}
				relatedContactId={contact.id}
				onActivityLogged={async () => {
					setRefreshKey((value) => value + 1);
				}}
			/>
		</div>
	);
}
