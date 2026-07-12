import type {
	AuthorizationScope,
	DealInput,
	DealRecord,
	DealStage,
	DealValidationResult,
	PipelineStageTotal,
	StageTransitionInput,
	StageTransitionValidationResult,
} from "@portfolio-saas-crm/db";
import {
	createDeal,
	getDealById,
	getPipelineTotals,
	listDealContactIds,
	listDeals,
	moveDealStage,
	updateDeal,
} from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { buildAuthorizationScope } from "../authz/scope";
import type { CrmProfileRecord } from "../authz/profile";
import { notFoundError, validationError } from "../shared/errors";

export type StageChangeActivityInput = {
	actorProfileId: string;
	dealId: string;
	companyId: string;
	fromStage: DealStage;
	toStage: DealStage;
};

export type DealsRouteDeps = {
	listDeals: typeof listDeals;
	getDealById: typeof getDealById;
	createDeal: typeof createDeal;
	updateDeal: typeof updateDeal;
	moveDealStage: typeof moveDealStage;
	getPipelineTotals: typeof getPipelineTotals;
	listDealContactIds: typeof listDealContactIds;
	recordStageChangeActivity: (
		input: StageChangeActivityInput,
	) => Promise<unknown>;
	buildScope: (
		profile: CrmProfileRecord,
		resource: "companies" | "contacts" | "deals",
	) => AuthorizationScope;
};

const defaultDeps: DealsRouteDeps = {
	listDeals,
	getDealById,
	createDeal,
	updateDeal,
	moveDealStage,
	getPipelineTotals,
	listDealContactIds,
	recordStageChangeActivity: async (input) => {
		const { createStageChangeActivity } = await import(
			"@portfolio-saas-crm/db"
		);
		return createStageChangeActivity(input);
	},
	buildScope: buildAuthorizationScope,
};

function dealScope(profile: CrmProfileRecord, deps: DealsRouteDeps) {
	return deps.buildScope(profile, "deals");
}

function handleDealMutationResult(
	result: DealRecord | DealValidationResult,
): DealRecord {
	if ("valid" in result && !result.valid) {
		validationError("Invalid deal input.", result.fieldErrors);
	}

	return result as DealRecord;
}

function handleStageMutationResult(
	result: DealRecord | StageTransitionValidationResult,
): DealRecord {
	if ("valid" in result && !result.valid) {
		validationError("Invalid stage transition.", result.fieldErrors);
	}

	return result as DealRecord;
}

function parseDealStage(value: unknown): DealStage | undefined {
	return typeof value === "string" ? (value as DealStage) : undefined;
}

export function createDealsRoutes(deps: DealsRouteDeps = defaultDeps) {
	return new Elysia({ name: "deals-routes" })
		.get("/deals", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = dealScope(crmProfile, deps);
			const companyId =
				typeof query.companyId === "string" ? query.companyId : undefined;
			const stage = parseDealStage(query.stage);
			const items = await deps.listDeals(scope, { companyId, stage });

			return {
				items,
				page: 1,
				pageSize: items.length,
				total: items.length,
			};
		})
		.get("/deals/pipeline", async (ctx) => {
			const { crmProfile } = ctx as typeof ctx & CrmAuthContext;
			const scope = dealScope(crmProfile, deps);
			const stages = await deps.getPipelineTotals(scope);

			return { stages } satisfies { stages: PipelineStageTotal[] };
		})
		.post("/deals", async (ctx) => {
			const { crmProfile, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = dealScope(crmProfile, deps);
			const result = await deps.createDeal(scope, body as DealInput);

			return handleDealMutationResult(result);
		})
		.get("/deals/:id", async (ctx) => {
			const { crmProfile, params } = ctx as typeof ctx & CrmAuthContext;
			const scope = dealScope(crmProfile, deps);
			const dealRecord = await deps.getDealById(scope, params.id);

			if (!dealRecord) {
				notFoundError("Deal not found");
			}

			const contactIds = await deps.listDealContactIds(dealRecord.id);

			return {
				...dealRecord,
				contactIds,
			};
		})
		.patch("/deals/:id", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = dealScope(crmProfile, deps);
			const result = await deps.updateDeal(
				scope,
				params.id,
				body as Partial<DealInput>,
			);

			if (!result) {
				notFoundError("Deal not found");
			}

			return handleDealMutationResult(result);
		})
		.post("/deals/:id/stage", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			const scope = dealScope(crmProfile, deps);
			const existing = await deps.getDealById(scope, params.id);

			if (!existing) {
				notFoundError("Deal not found");
			}

			const result = await deps.moveDealStage(
				scope,
				params.id,
				body as StageTransitionInput,
			);

			if (!result) {
				notFoundError("Deal not found");
			}

			const updatedDeal = handleStageMutationResult(result);

			if (existing.stage !== updatedDeal.stage) {
				await deps.recordStageChangeActivity({
					actorProfileId: crmProfile.id,
					dealId: updatedDeal.id,
					companyId: updatedDeal.companyId,
					fromStage: existing.stage,
					toStage: updatedDeal.stage,
				});
			}

			return updatedDeal;
		});
}

export const dealsRoutes = createDealsRoutes();

export type { DealRecord };
