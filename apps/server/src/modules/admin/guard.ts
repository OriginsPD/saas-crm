import type { CrmProfileRecord } from "@portfolio-saas-crm/db";
import { status } from "elysia";

import type { ApiErrorBody } from "../authz/middleware";

export function requireAdministrator(profile: CrmProfileRecord): void {
	if (profile.role !== "administrator") {
		throw status(403, {
			code: "FORBIDDEN",
			message: "Administrator access required",
		} satisfies ApiErrorBody);
	}
}
