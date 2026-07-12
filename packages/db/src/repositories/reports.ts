import { and, count, eq, gte, lte, sql, sum, type SQL } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm/column";

import {
	type AuthorizationScope,
	buildOwnerScopeFilter,
} from "../authorization/scope";
import { db } from "../index";
import { activity, deal, task } from "../schema/crm";
import { DEAL_STAGES, type DealStage, type PipelineStageTotal } from "./deals";

export type ReportFilters = {
	ownerProfileId?: string;
	fromDate?: string | null;
	toDate?: string | null;
};

export type ReportFilterValidationResult =
	| { valid: true; value: ReportFilters }
	| {
			valid: false;
			fieldErrors: Record<string, string[]>;
	  };

export type PipelineReport = {
	stages: PipelineStageTotal[];
	totalOpenValueCents: number;
	totalOpenDeals: number;
};

export type PerformanceReport = {
	openDeals: number;
	closedWonCount: number;
	closedLostCount: number;
	totalPipelineValueCents: number;
	activityCount: number;
};

export type TaskReport = {
	openCount: number;
	completedCount: number;
	overdueCount: number;
};

function parseDateOnly(value: string | null | undefined): string | null {
	if (!value?.trim()) {
		return null;
	}

	return value.trim();
}

function endOfDay(value: string): Date {
	return new Date(`${value}T23:59:59.999Z`);
}

export function validateReportFilters(
	filters: ReportFilters,
): ReportFilterValidationResult {
	const fieldErrors: Record<string, string[]> = {};
	const fromDate = parseDateOnly(filters.fromDate);
	const toDate = parseDateOnly(filters.toDate);

	if (fromDate && toDate && fromDate > toDate) {
		fieldErrors.toDate = ["End date must be on or after start date."];
	}

	if (Object.keys(fieldErrors).length > 0) {
		return { valid: false, fieldErrors };
	}

	return {
		valid: true,
		value: {
			ownerProfileId: filters.ownerProfileId?.trim() || undefined,
			fromDate,
			toDate,
		},
	};
}

function scopedOwnerFilter(
	scope: AuthorizationScope,
	ownerColumn: AnyColumn,
	filters?: ReportFilters,
): SQL | undefined {
	const conditions: SQL[] = [];
	const scopeFilter = buildOwnerScopeFilter(scope, ownerColumn);

	if (scopeFilter) {
		conditions.push(scopeFilter);
	}

	if (filters?.ownerProfileId) {
		conditions.push(eq(ownerColumn, filters.ownerProfileId));
	}

	return conditions.length > 0 ? and(...conditions) : undefined;
}

function dateRangeFilter(
	column: AnyColumn,
	filters?: ReportFilters,
): SQL | undefined {
	const conditions: SQL[] = [];

	if (filters?.fromDate) {
		conditions.push(gte(column, new Date(`${filters.fromDate}T00:00:00.000Z`)));
	}

	if (filters?.toDate) {
		conditions.push(lte(column, endOfDay(filters.toDate)));
	}

	return conditions.length > 0 ? and(...conditions) : undefined;
}

function combineFilters(filters: Array<SQL | undefined>): SQL | undefined {
	const conditions = filters.filter(Boolean) as SQL[];

	return conditions.length > 0 ? and(...conditions) : undefined;
}

export function buildPipelineReportQuery(
	scope: AuthorizationScope,
	filters?: ReportFilters,
) {
	const whereClause = scopedOwnerFilter(scope, deal.ownerProfileId, filters);

	return db
		.select({
			stage: deal.stage,
			dealCount: count(deal.id),
			totalValueCents: sum(deal.valueCents),
		})
		.from(deal)
		.where(whereClause ? and(whereClause) : undefined)
		.groupBy(deal.stage);
}

export async function getPipelineReport(
	scope: AuthorizationScope,
	filters?: ReportFilters,
): Promise<PipelineReport | ReportFilterValidationResult> {
	const validation = validateReportFilters(filters ?? {});

	if (!validation.valid) {
		return validation;
	}

	const rows = await buildPipelineReportQuery(scope, validation.value);
	const totalsByStage = new Map<DealStage, PipelineStageTotal>();

	for (const stage of DEAL_STAGES) {
		totalsByStage.set(stage, {
			stage,
			dealCount: 0,
			totalValueCents: 0,
		});
	}

	for (const row of rows) {
		totalsByStage.set(row.stage, {
			stage: row.stage,
			dealCount: Number(row.dealCount),
			totalValueCents: Number(row.totalValueCents ?? 0),
		});
	}

	const stages = DEAL_STAGES.map((stage) => totalsByStage.get(stage)!);
	const openStages = stages.filter(
		(item) => item.stage !== "closed_won" && item.stage !== "closed_lost",
	);

	return {
		stages,
		totalOpenValueCents: openStages.reduce(
			(total, item) => total + item.totalValueCents,
			0,
		),
		totalOpenDeals: openStages.reduce(
			(total, item) => total + item.dealCount,
			0,
		),
	};
}

export async function getPerformanceReport(
	scope: AuthorizationScope,
	filters?: ReportFilters,
): Promise<PerformanceReport | ReportFilterValidationResult> {
	const validation = validateReportFilters(filters ?? {});

	if (!validation.valid) {
		return validation;
	}

	const dealScope = scopedOwnerFilter(
		scope,
		deal.ownerProfileId,
		validation.value,
	);
	const activityScope = scopedOwnerFilter(
		scope,
		activity.actorProfileId,
		validation.value,
	);
	const activityDateScope = dateRangeFilter(
		activity.occurredAt,
		validation.value,
	);

	const [
		openDealRows,
		closedWonRows,
		closedLostRows,
		pipelineRows,
		activityRows,
	] = await Promise.all([
		db
			.select({ dealCount: count(deal.id) })
			.from(deal)
			.where(
				combineFilters([
					dealScope,
					sql`${deal.stage} not in ('closed_won', 'closed_lost')`,
				]),
			),
		db
			.select({ dealCount: count(deal.id) })
			.from(deal)
			.where(
				combineFilters([
					dealScope,
					eq(deal.stage, "closed_won"),
					dateRangeFilter(deal.closedAt, validation.value),
				]),
			),
		db
			.select({ dealCount: count(deal.id) })
			.from(deal)
			.where(
				combineFilters([
					dealScope,
					eq(deal.stage, "closed_lost"),
					dateRangeFilter(deal.closedAt, validation.value),
				]),
			),
		db
			.select({ totalValueCents: sum(deal.valueCents) })
			.from(deal)
			.where(
				combineFilters([
					dealScope,
					sql`${deal.stage} not in ('closed_won', 'closed_lost')`,
				]),
			),
		db
			.select({ activityCount: count(activity.id) })
			.from(activity)
			.where(combineFilters([activityScope, activityDateScope])),
	]);

	return {
		openDeals: Number(openDealRows[0]?.dealCount ?? 0),
		closedWonCount: Number(closedWonRows[0]?.dealCount ?? 0),
		closedLostCount: Number(closedLostRows[0]?.dealCount ?? 0),
		totalPipelineValueCents: Number(pipelineRows[0]?.totalValueCents ?? 0),
		activityCount: Number(activityRows[0]?.activityCount ?? 0),
	};
}

export function buildTaskReportQuery(
	scope: AuthorizationScope,
	filters?: ReportFilters,
) {
	const whereClause = scopedOwnerFilter(scope, task.assigneeProfileId, filters);

	return db.select().from(task).where(whereClause);
}

export async function getTaskReport(
	scope: AuthorizationScope,
	filters?: ReportFilters,
): Promise<TaskReport | ReportFilterValidationResult> {
	const validation = validateReportFilters(filters ?? {});

	if (!validation.valid) {
		return validation;
	}

	const taskScope = scopedOwnerFilter(
		scope,
		task.assigneeProfileId,
		validation.value,
	);
	const completedDateScope = dateRangeFilter(
		task.completedAt,
		validation.value,
	);

	const [openRows, completedRows, overdueRows] = await Promise.all([
		db
			.select({ taskCount: count(task.id) })
			.from(task)
			.where(combineFilters([taskScope, eq(task.status, "open")])),
		db
			.select({ taskCount: count(task.id) })
			.from(task)
			.where(
				combineFilters([
					taskScope,
					eq(task.status, "completed"),
					completedDateScope,
				]),
			),
		db
			.select({ taskCount: count(task.id) })
			.from(task)
			.where(
				combineFilters([
					taskScope,
					eq(task.status, "open"),
					sql`${task.dueDate} is not null and ${task.dueDate} < CURRENT_DATE`,
				]),
			),
	]);

	return {
		openCount: Number(openRows[0]?.taskCount ?? 0),
		completedCount: Number(completedRows[0]?.taskCount ?? 0),
		overdueCount: Number(overdueRows[0]?.taskCount ?? 0),
	};
}
