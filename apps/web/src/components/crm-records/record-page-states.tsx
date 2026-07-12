import { Skeleton } from "@portfolio-saas-crm/ui/components/skeleton";
import { useEffect, useState } from "react";

import { CrmShellErrorState } from "@/components/crm-shell/shell-states";

export function RecordPageLoadingState() {
	return (
		<div className="space-y-4 p-4 md:p-6" data-testid="record-page-loading">
			<Skeleton className="h-8 w-48" />
			<Skeleton className="h-4 w-72" />
			<Skeleton className="h-64 w-full" />
		</div>
	);
}

export function useAsyncResource<T>(loader: () => Promise<T>, deps: unknown[]) {
	const [state, setState] = useState<
		| { status: "loading" }
		| { status: "ready"; data: T }
		| { status: "error"; message: string }
	>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;
		setState({ status: "loading" });

		loader()
			.then((data) => {
				if (!cancelled) {
					setState({ status: "ready", data });
				}
			})
			.catch((error: Error) => {
				if (!cancelled) {
					setState({
						status: "error",
						message: error.message || "Failed to load records.",
					});
				}
			});

		return () => {
			cancelled = true;
		};
	}, deps);

	return state;
}

export function RecordPageError({ message }: { message: string }) {
	return <CrmShellErrorState message={message} />;
}
