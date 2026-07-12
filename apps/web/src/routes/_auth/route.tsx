import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { CrmShell } from "@/components/crm-shell/crm-shell";
import { CrmProfileProvider } from "@/components/crm-shell/crm-profile-context";
import {
	CrmPermissionDeniedState,
	CrmShellErrorState,
	CrmShellLoadingState,
} from "@/components/crm-shell/shell-states";
import { useCrmProfile } from "@/components/crm-shell/use-crm-profile";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
	ssr: false,
	component: AuthLayout,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				to: "/login",
			});
		}
		return { session };
	},
});

function AuthLayout() {
	const profileState = useCrmProfile();

	if (profileState.status === "loading") {
		return <CrmShellLoadingState />;
	}

	if (profileState.status === "denied") {
		return <CrmPermissionDeniedState message={profileState.message} />;
	}

	if (profileState.status === "error") {
		return <CrmShellErrorState message={profileState.message} />;
	}

	return (
		<CrmProfileProvider profile={profileState.profile}>
			<CrmShell profile={profileState.profile}>
				<Outlet />
			</CrmShell>
		</CrmProfileProvider>
	);
}
