import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@portfolio-saas-crm/ui/components/empty";
import { Skeleton } from "@portfolio-saas-crm/ui/components/skeleton";
import { AlertTriangle, Inbox, ShieldAlert } from "lucide-react";

export function CrmShellLoadingState() {
	return (
		<div
			className="flex min-h-0 flex-1 flex-col gap-6 p-4 md:p-6"
			data-testid="crm-shell-loading"
		>
			<div className="space-y-2">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-72" />
			</div>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-28 w-full" />
				))}
			</div>
			<Skeleton className="h-64 w-full" />
		</div>
	);
}

export function CrmPermissionDeniedState({
	message = "You do not have access to this CRM workspace.",
}: {
	message?: string;
}) {
	return (
		<div
			className="flex min-h-0 flex-1 items-center justify-center p-6"
			data-testid="crm-shell-permission-denied"
		>
			<Empty className="max-w-lg border border-border/60 bg-card/40">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ShieldAlert aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>Access denied</EmptyTitle>
					<EmptyDescription>{message}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}

export function CrmEmptyDashboardState({
	roleLabel,
	scopeLabel,
}: {
	roleLabel: string;
	scopeLabel: string;
}) {
	return (
		<div
			className="flex min-h-0 flex-1 items-center justify-center p-6"
			data-testid="crm-shell-empty"
		>
			<Empty className="max-w-xl border border-dashed border-border/70 bg-card/30">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Inbox aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>Workspace ready</EmptyTitle>
					<EmptyDescription>
						Your {roleLabel} shell is configured for {scopeLabel}. CRM records
						will appear here as companies, deals, and tasks are added in later
						phases.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}

export function CrmShellErrorState({ message }: { message: string }) {
	return (
		<div
			className="flex min-h-0 flex-1 items-center justify-center p-6"
			data-testid="crm-shell-error"
		>
			<Empty className="max-w-lg border border-destructive/30 bg-card/40">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<AlertTriangle aria-hidden="true" />
					</EmptyMedia>
					<EmptyTitle>Unable to load CRM profile</EmptyTitle>
					<EmptyDescription>{message}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}
