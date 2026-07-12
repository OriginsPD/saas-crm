import { cn } from "@portfolio-saas-crm/ui/lib/utils";

import type { CrmViewScope } from "@/lib/crm-client";
import { getResourceScopeLabel } from "@/lib/crm-client";

export function ScopeBadge({
	scope,
	className,
}: {
	scope: CrmViewScope;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-muted-foreground text-xs",
				className,
			)}
			data-testid="scope-badge"
		>
			{getResourceScopeLabel(scope)}
		</span>
	);
}

export function StatusBadge({
	status,
}: {
	status: "prospect" | "active" | "archived";
}) {
	const label =
		status === "prospect"
			? "Prospect"
			: status === "active"
				? "Active"
				: "Archived";

	return (
		<span className="inline-flex rounded-full border border-border/70 px-2 py-0.5 text-xs capitalize">
			{label}
		</span>
	);
}
