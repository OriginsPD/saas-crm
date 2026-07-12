import type {
	ActivityInput,
	ActivityRecord,
	ActivityType,
	ActivityValidationResult,
	AuthorizationScope,
} from "@portfolio-saas-crm/db";
import { createActivity, listActivities } from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { buildAuthorizationScope } from "../authz/scope";
import type { CrmProfileRecord } from "../authz/profile";
import { validationError } from "../shared/errors";

export type ActivitiesRouteDeps = {
	listActivities: typeof listActivities;
	createActivity: typeof createActivity;
	buildScope: (
		profile: CrmProfileRecord,
		resource: "activity",
	) => AuthorizationScope;
};

const defaultDeps: ActivitiesRouteDeps = {
	listActivities,
	createActivity,
	buildScope: buildAuthorizationScope,
};

function activityScope(profile: CrmProfileRecord, deps: ActivitiesRouteDeps) {
	return deps.buildScope(profile, "activity");
}

function handleActivityMutationResult(
	result: ActivityRecord | ActivityValidationResult,
): ActivityRecord {
	if ("valid" in result && !result.valid) {
		validationError("Invalid activity input.", result.fieldErrors);
	}

	return result as ActivityRecord;
}

function parseActivityType(value: unknown): ActivityType | undefined {
	return typeof value === "string" ? (value as ActivityType) : undefined;
}

export function createActivitiesRoutes(
	deps: ActivitiesRouteDeps = defaultDeps,
) {
	return new Elysia({ name: "activities-routes" })
		.get("/activity", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = activityScope(crmProfile, deps);
			const relatedCompanyId =
				typeof query.relatedCompanyId === "string"
					? query.relatedCompanyId
					: undefined;
			const relatedContactId =
				typeof query.relatedContactId === "string"
					? query.relatedContactId
					: undefined;
			const relatedDealId =
				typeof query.relatedDealId === "string"
					? query.relatedDealId
					: undefined;
			const type = parseActivityType(query.type);
			const items = await deps.listActivities(scope, {
				relatedCompanyId,
				relatedContactId,
				relatedDealId,
				type,
			});

			return {
				items,
				page: 1,
				pageSize: items.length,
				total: items.length,
			};
		})
		.post("/activity", async (ctx) => {
			const { crmProfile, body } = ctx as typeof ctx & CrmAuthContext;
			const input = {
				...(body as ActivityInput),
				actorProfileId: crmProfile.id,
			};
			const result = await deps.createActivity(input);

			return handleActivityMutationResult(result);
		});
}

export const activitiesRoutes = createActivitiesRoutes();

export type { ActivityRecord };
