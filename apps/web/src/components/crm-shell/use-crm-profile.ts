import { useEffect, useState } from "react";

import { fetchCrmMe, type CrmMeResponse } from "@/lib/crm-client";

type CrmProfileState =
	| { status: "loading" }
	| { status: "ready"; profile: CrmMeResponse }
	| { status: "denied"; message: string }
	| { status: "error"; message: string };

export function useCrmProfile(): CrmProfileState {
	const [state, setState] = useState<CrmProfileState>({ status: "loading" });

	useEffect(() => {
		let cancelled = false;

		fetchCrmMe()
			.then((profile) => {
				if (!cancelled) {
					setState({ status: "ready", profile });
				}
			})
			.catch((error: Error & { status?: number; code?: string }) => {
				if (cancelled) {
					return;
				}

				if (error.status === 403) {
					setState({
						status: "denied",
						message: error.message || "Account disabled or CRM access denied.",
					});
					return;
				}

				setState({
					status: "error",
					message: error.message || "Failed to load CRM profile.",
				});
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return state;
}
