import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { ContactsListPanel } from "@/components/crm-records/contacts-list-panel";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import { fetchContacts } from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/contacts/")({
	component: ContactsIndexPage,
});

function ContactsIndexPage() {
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const state = useAsyncResource(() => fetchContacts(), []);

	if (state.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (state.status === "error") {
		return <RecordPageError message={state.message} />;
	}

	return (
		<div className="p-4 md:p-6">
			<ContactsListPanel
				contacts={state.data.items}
				scope={crmProfile.viewScopes.contacts ?? "deny"}
				permissions={crmProfile.permissions}
				onSelectContact={(contact) => {
					void navigate({
						to: "/contacts/$contactId",
						params: { contactId: contact.id },
					});
				}}
			/>
		</div>
	);
}
