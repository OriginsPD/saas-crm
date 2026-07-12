import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";

import type { ReportFilters } from "@/lib/crm-client";

type ReportFiltersFormProps = {
	filters: ReportFilters;
	onChange: (filters: ReportFilters) => void;
	showOwnerFilter?: boolean;
};

export function ReportFiltersForm({
	filters,
	onChange,
	showOwnerFilter = false,
}: ReportFiltersFormProps) {
	return (
		<div
			className="grid gap-4 md:grid-cols-3"
			data-testid="report-filters-form"
		>
			{showOwnerFilter ? (
				<div className="space-y-2">
					<Label htmlFor="report-owner">Owner profile ID</Label>
					<Input
						id="report-owner"
						value={filters.ownerProfileId ?? ""}
						onChange={(event) =>
							onChange({
								...filters,
								ownerProfileId: event.target.value || undefined,
							})
						}
						placeholder="Filter by owner"
					/>
				</div>
			) : null}
			<div className="space-y-2">
				<Label htmlFor="report-from-date">From date</Label>
				<Input
					id="report-from-date"
					type="date"
					value={filters.fromDate ?? ""}
					onChange={(event) =>
						onChange({
							...filters,
							fromDate: event.target.value || null,
						})
					}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="report-to-date">To date</Label>
				<Input
					id="report-to-date"
					type="date"
					value={filters.toDate ?? ""}
					onChange={(event) =>
						onChange({
							...filters,
							toDate: event.target.value || null,
						})
					}
				/>
			</div>
		</div>
	);
}
