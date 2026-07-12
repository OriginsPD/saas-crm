import { auth } from "@portfolio-saas-crm/auth";
import { Elysia, status } from "elysia";

import { type CrmProfileRecord, loadCrmProfileByUserId } from "./profile";

export type ApiErrorBody = {
	code: "UNAUTHENTICATED" | "FORBIDDEN";
	message: string;
};

export type CrmSessionUser = {
	id: string;
	name: string;
	email: string;
};

export type CrmSession = {
	user: CrmSessionUser;
};

export interface CrmAuthDependencies {
	getSession: (headers: Headers) => Promise<CrmSession | null>;
	loadProfile: (userId: string) => Promise<CrmProfileRecord | null>;
}

export function createCrmAuthPlugin(deps: CrmAuthDependencies) {
	return new Elysia({ name: "crm-auth" }).derive(
		{ as: "scoped" },
		async ({ request }) => {
			const session = await deps.getSession(request.headers);

			if (!session?.user) {
				throw status(401, {
					code: "UNAUTHENTICATED",
					message: "Authentication required",
				} satisfies ApiErrorBody);
			}

			const profile = await deps.loadProfile(session.user.id);

			if (!profile) {
				throw status(403, {
					code: "FORBIDDEN",
					message: "CRM profile not found",
				} satisfies ApiErrorBody);
			}

			if (profile.status === "disabled") {
				throw status(403, {
					code: "FORBIDDEN",
					message: "Account disabled",
				} satisfies ApiErrorBody);
			}

			return {
				crmSession: session,
				crmProfile: profile,
			};
		},
	);
}

export const crmAuthPlugin = createCrmAuthPlugin({
	getSession: async (headers) => {
		const session = await auth.api.getSession({ headers });
		return session;
	},
	loadProfile: loadCrmProfileByUserId,
});
