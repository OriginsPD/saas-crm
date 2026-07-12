import { createContext, useContext } from "react";

import type { CrmMeResponse } from "@/lib/crm-client";

const CrmProfileContext = createContext<CrmMeResponse | null>(null);

export function CrmProfileProvider({
	profile,
	children,
}: {
	profile: CrmMeResponse;
	children: React.ReactNode;
}) {
	return (
		<CrmProfileContext.Provider value={profile}>
			{children}
		</CrmProfileContext.Provider>
	);
}

export function useCrmProfileContext(): CrmMeResponse {
	const profile = useContext(CrmProfileContext);

	if (!profile) {
		throw new Error("CRM profile context is unavailable.");
	}

	return profile;
}
