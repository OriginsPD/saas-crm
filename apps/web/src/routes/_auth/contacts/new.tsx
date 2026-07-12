import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { ContactForm } from "@/components/forms/contact-form";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	createContact,
	fetchCompanies,
	hasCrmPermission,
	type CrmRequestError,
} from "@/lib/crm-client";

type ContactsNewSearch = {
	companyId?: string;
};

export const Route = createFileRoute("/_auth/contacts/new")({
	component: NewContactPage,
	validateSearch: (search: Record<string, unknown>): ContactsNewSearch => ({
		companyId:
			typeof search.companyId === "string" ? search.companyId : undefined,
	}),
});

function NewContactPage() {
	const { companyId } = Route.useSearch();
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const companiesState = useAsyncResource(() => fetchCompanies(), []);

	if (!hasCrmPermission(crmProfile.permissions, "contacts.create")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to create contacts.
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
					to="/contacts"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					← Back to contacts
				</Link>
				<h1 className="font-semibold text-2xl tracking-tight">New contact</h1>
				<p className="text-muted-foreground text-sm">
					Add a person to an account in your scope.
				</p>
				<ScopeBadge scope={crmProfile.viewScopes.contacts ?? "deny"} />
			</div>

			<ContactForm
				submitLabel="Create contact"
				initialValues={{
					companyId: companyId ?? "",
					firstName: "",
					lastName: "",
					title: "",
					email: "",
					phone: "",
					status: "active",
				}}
				lockCompany={Boolean(companyId)}
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
						const contact = await createContact(input);
						toast.success("Contact created");
						await navigate({
							to: "/contacts/$contactId",
							params: { contactId: contact.id },
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
