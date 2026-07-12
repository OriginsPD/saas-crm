import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import { Plus } from "lucide-react";

import { CrmDataTable } from "@/components/data-table/crm-data-table";
import {
	ScopeBadge,
	StatusBadge,
} from "@/components/crm-records/record-badges";
import type { ContactRecord, CrmViewScope } from "@/lib/crm-client";
import { hasCrmPermission } from "@/lib/crm-client";

type ContactsListPanelProps = {
	contacts: ContactRecord[];
	scope: CrmViewScope;
	permissions: readonly string[];
	onSelectContact?: (contact: ContactRecord) => void;
};

export function ContactsListPanel({
	contacts,
	scope,
	permissions,
	onSelectContact,
}: ContactsListPanelProps) {
	const canCreate = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"contacts.create",
	);

	return (
		<div className="space-y-6" data-testid="contacts-list-panel">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-semibold text-2xl tracking-tight">Contacts</h1>
					<p className="max-w-2xl text-muted-foreground text-sm">
						People tied to accounts in your current scope.
					</p>
					<ScopeBadge scope={scope} />
				</div>
				{canCreate ? (
					<a href="/contacts/new" className={buttonVariants()}>
						<Plus className="size-4" aria-hidden="true" />
						New contact
					</a>
				) : null}
			</div>

			<CrmDataTable
				testId="contacts-table"
				rows={contacts}
				searchPlaceholder="Search contacts"
				emptyTitle="No contacts in scope"
				emptyDescription="Create a contact or adjust your search to see people in this workspace."
				getRowId={(contact) => contact.id}
				onRowClick={onSelectContact}
				columns={[
					{
						id: "name",
						header: "Name",
						searchValue: (contact) =>
							`${contact.firstName} ${contact.lastName} ${contact.email ?? ""}`,
						cell: (contact) => (
							<div>
								<p className="font-medium">
									{contact.firstName} {contact.lastName}
								</p>
								{contact.title ? (
									<p className="text-muted-foreground text-xs">
										{contact.title}
									</p>
								) : null}
							</div>
						),
					},
					{
						id: "email",
						header: "Email",
						searchValue: (contact) => contact.email ?? "",
						cell: (contact) => contact.email ?? "—",
					},
					{
						id: "phone",
						header: "Phone",
						searchValue: (contact) => contact.phone ?? "",
						cell: (contact) => contact.phone ?? "—",
					},
					{
						id: "status",
						header: "Status",
						cell: (contact) => (
							<StatusBadge
								status={contact.status === "archived" ? "archived" : "active"}
							/>
						),
					},
				]}
			/>
		</div>
	);
}
