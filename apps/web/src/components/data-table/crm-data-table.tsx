import { Input } from "@portfolio-saas-crm/ui/components/input";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@portfolio-saas-crm/ui/components/empty";
import { cn } from "@portfolio-saas-crm/ui/lib/utils";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export type CrmDataTableColumn<T> = {
	id: string;
	header: string;
	cell: (row: T) => React.ReactNode;
	searchValue?: (row: T) => string;
	className?: string;
};

type CrmDataTableProps<T> = {
	columns: CrmDataTableColumn<T>[];
	rows: T[];
	searchPlaceholder?: string;
	emptyTitle: string;
	emptyDescription: string;
	getRowId: (row: T) => string;
	onRowClick?: (row: T) => void;
	testId?: string;
};

export function CrmDataTable<T>({
	columns,
	rows,
	searchPlaceholder = "Search records",
	emptyTitle,
	emptyDescription,
	getRowId,
	onRowClick,
	testId,
}: CrmDataTableProps<T>) {
	const [query, setQuery] = useState("");

	const filteredRows = useMemo(() => {
		const normalized = query.trim().toLowerCase();

		if (!normalized) {
			return rows;
		}

		return rows.filter((row) =>
			columns.some((column) =>
				column.searchValue?.(row)?.toLowerCase().includes(normalized),
			),
		);
	}, [columns, query, rows]);

	return (
		<div className="space-y-4" data-testid={testId}>
			<div className="relative max-w-md">
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder={searchPlaceholder}
					className="pl-9"
					aria-label={searchPlaceholder}
					data-testid={`${testId ?? "crm-data-table"}-search`}
				/>
			</div>

			{filteredRows.length === 0 ? (
				<Empty
					className="border border-dashed border-border/70 bg-card/30"
					data-testid={`${testId ?? "crm-data-table"}-empty`}
				>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Search aria-hidden="true" />
						</EmptyMedia>
						<EmptyTitle>{emptyTitle}</EmptyTitle>
						<EmptyDescription>{emptyDescription}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border/70">
					<table className="min-w-full text-sm">
						<thead className="border-border/70 border-b bg-muted/30">
							<tr>
								{columns.map((column) => (
									<th
										key={column.id}
										scope="col"
										className={cn(
											"px-4 py-3 text-left font-medium text-muted-foreground",
											column.className,
										)}
									>
										{column.header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filteredRows.map((row) => {
								const rowId = getRowId(row);
								const clickable = Boolean(onRowClick);

								return (
									<tr
										key={rowId}
										data-row-id={rowId}
										className={cn(
											"border-border/60 border-b last:border-b-0",
											clickable && "cursor-pointer hover:bg-muted/20",
										)}
										onClick={clickable ? () => onRowClick?.(row) : undefined}
										onKeyDown={
											clickable
												? (event) => {
														if (event.key === "Enter" || event.key === " ") {
															event.preventDefault();
															onRowClick?.(row);
														}
													}
												: undefined
										}
										tabIndex={clickable ? 0 : undefined}
									>
										{columns.map((column) => (
											<td
												key={column.id}
												className={cn(
													"px-4 py-3 align-middle",
													column.className,
												)}
											>
												{column.cell(row)}
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
