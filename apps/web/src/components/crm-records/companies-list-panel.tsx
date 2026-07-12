import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import { Plus } from "lucide-react";

import { CrmDataTable } from "@/components/data-table/crm-data-table";
import {
	ScopeBadge,
	StatusBadge,
} from "@/components/crm-records/record-badges";
import type { CompanyRecord, CrmViewScope } from "@/lib/crm-client";
import { hasCrmPermission } from "@/lib/crm-client";

type CompaniesListPanelProps = {
	companies: CompanyRecord[];
	scope: CrmViewScope;
	permissions: readonly string[];
	onSelectCompany?: (company: CompanyRecord) => void;
};

export function CompaniesListPanel({
	companies,
	scope,
	permissions,
	onSelectCompany,
}: CompaniesListPanelProps) {
	const canCreate = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"companies.create",
	);

	return (
		<div className="space-y-6" data-testid="companies-list-panel">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-semibold text-2xl tracking-tight">Companies</h1>
					<p className="max-w-2xl text-muted-foreground text-sm">
						Accounts visible within your authorization scope.
					</p>
					<ScopeBadge scope={scope} />
				</div>
				{canCreate ? (
					<a href="/companies/new" className={buttonVariants()}>
						<Plus className="size-4" aria-hidden="true" />
						New company
					</a>
				) : null}
			</div>

			<CrmDataTable
				testId="companies-table"
				rows={companies}
				searchPlaceholder="Search companies"
				emptyTitle="No companies in scope"
				emptyDescription="Create a company or adjust your search to see records in this workspace."
				getRowId={(company) => company.id}
				onRowClick={onSelectCompany}
				columns={[
					{
						id: "name",
						header: "Name",
						searchValue: (company) =>
							`${company.name} ${company.domain ?? ""} ${company.industry ?? ""}`,
						cell: (company) => (
							<div>
								<p className="font-medium">{company.name}</p>
								{company.domain ? (
									<p className="text-muted-foreground text-xs">
										{company.domain}
									</p>
								) : null}
							</div>
						),
					},
					{
						id: "industry",
						header: "Industry",
						searchValue: (company) => company.industry ?? "",
						cell: (company) => company.industry ?? "—",
					},
					{
						id: "size",
						header: "Size",
						cell: (company) => company.size?.replace("_", " ") ?? "—",
					},
					{
						id: "status",
						header: "Status",
						cell: (company) => <StatusBadge status={company.status} />,
					},
				]}
			/>
		</div>
	);
}
