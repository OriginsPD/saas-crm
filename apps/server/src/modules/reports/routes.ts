import type {
	AuthorizationScope,
	PerformanceReport,
	PipelineReport,
	ReportFilterValidationResult,
	ReportFilters,
	TaskReport,
} from "@portfolio-saas-crm/db";
import {
	getPerformanceReport,
	getPipelineReport,
	getTaskReport,
	validateReportFilters,
} from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { buildAuthorizationScope } from "../authz/scope";
import type { CrmProfileRecord } from "../authz/profile";
import { validationError } from "../shared/errors";

export type ReportsRouteDeps = {
	getPipelineReport: typeof getPipelineReport;
	getPerformanceReport: typeof getPerformanceReport;
	getTaskReport: typeof getTaskReport;
	buildScope: (
		profile: CrmProfileRecord,
		resource: "reports",
	) => AuthorizationScope;
};

const defaultDeps: ReportsRouteDeps = {
	getPipelineReport,
	getPerformanceReport,
	getTaskReport,
	buildScope: buildAuthorizationScope,
};

function reportScope(profile: CrmProfileRecord, deps: ReportsRouteDeps) {
	return deps.buildScope(profile, "reports");
}

function parseReportFilters(query: Record<string, unknown>): ReportFilters {
	return {
		ownerProfileId:
			typeof query.ownerProfileId === "string"
				? query.ownerProfileId
				: undefined,
		fromDate: typeof query.fromDate === "string" ? query.fromDate : undefined,
		toDate: typeof query.toDate === "string" ? query.toDate : undefined,
	};
}

function handleReportResult<T>(result: T | ReportFilterValidationResult): T {
	if (
		result &&
		typeof result === "object" &&
		"valid" in result &&
		!result.valid
	) {
		validationError("Invalid report filters.", result.fieldErrors);
	}

	return result as T;
}

export function createReportsRoutes(deps: ReportsRouteDeps = defaultDeps) {
	return new Elysia({ name: "reports-routes" })
		.get("/reports/pipeline", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = reportScope(crmProfile, deps);
			const filters = parseReportFilters(query);
			const fieldErrors = validateReportFilters(filters);

			if (!fieldErrors.valid) {
				validationError("Invalid report filters.", fieldErrors.fieldErrors);
			}

			const result = await deps.getPipelineReport(scope, filters);

			return handleReportResult<PipelineReport>(result);
		})
		.get("/reports/performance", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = reportScope(crmProfile, deps);
			const filters = parseReportFilters(query);
			const fieldErrors = validateReportFilters(filters);

			if (!fieldErrors.valid) {
				validationError("Invalid report filters.", fieldErrors.fieldErrors);
			}

			const result = await deps.getPerformanceReport(scope, filters);

			return handleReportResult<PerformanceReport>(result);
		})
		.get("/reports/tasks", async (ctx) => {
			const { crmProfile, query } = ctx as typeof ctx & CrmAuthContext;
			const scope = reportScope(crmProfile, deps);
			const filters = parseReportFilters(query);
			const fieldErrors = validateReportFilters(filters);

			if (!fieldErrors.valid) {
				validationError("Invalid report filters.", fieldErrors.fieldErrors);
			}

			const result = await deps.getTaskReport(scope, filters);

			return handleReportResult<TaskReport>(result);
		});
}

export const reportsRoutes = createReportsRoutes();
