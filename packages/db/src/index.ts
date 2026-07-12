import { env } from "@portfolio-saas-crm/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export function createDb() {
	return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();

export {
	getCrmProfileByUserId,
	type CrmProfileRecord,
} from "./repositories/crm-profile";

export {
	buildCompanyListQuery,
	canAccessCompany,
	createCompany,
	getCompanyById,
	listCompanies,
	updateCompany,
	archiveCompany,
	type CompanyInput,
	type CompanyRecord,
} from "./repositories/companies";

export {
	buildContactListQuery,
	canAccessContact,
	createContact,
	getContactById,
	listContacts,
	updateContact,
	archiveContact,
	validateContactInput,
	type ContactInput,
	type ContactRecord,
	type ContactValidationResult,
} from "./repositories/contacts";

export {
	buildDealListQuery,
	canAccessDeal,
	createDeal,
	DEAL_STAGES,
	getDealById,
	getPipelineTotals,
	listDealContactIds,
	listDeals,
	moveDealStage,
	updateDeal,
	validateDealInput,
	validateStageTransition,
	type DealInput,
	type DealRecord,
	type DealStage,
	type DealValidationResult,
	type PipelineStageTotal,
	type StageTransitionInput,
	type StageTransitionValidationResult,
} from "./repositories/deals";

export {
	ACTIVITY_TYPES,
	buildActivityListQuery,
	canAccessActivity,
	createActivity,
	createStageChangeActivity,
	createTaskCompletedActivity,
	listActivities,
	sortActivitiesReverseChronological,
	validateActivityInput,
	type ActivityInput,
	type ActivityRecord,
	type ActivityType,
	type ActivityValidationResult,
	type StageChangeActivityInput,
	type TaskCompletedActivityInput,
} from "./repositories/activities";

export {
	buildTaskListQuery,
	canAccessTask,
	completeTask,
	createTask,
	getTaskById,
	listTasks,
	reopenTask,
	TASK_PRIORITIES,
	TASK_STATUSES,
	updateTask,
	validateTaskInput,
	type TaskInput,
	type TaskPriority,
	type TaskRecord,
	type TaskStatus,
	type TaskValidationResult,
} from "./repositories/tasks";

export {
	buildPipelineReportQuery,
	buildTaskReportQuery,
	getPerformanceReport,
	getPipelineReport,
	getTaskReport,
	validateReportFilters,
	type PerformanceReport,
	type PipelineReport,
	type ReportFilterValidationResult,
	type ReportFilters,
	type TaskReport,
} from "./repositories/reports";

export {
	createCrmProfile,
	getAdminUserByProfileId,
	listAdminUsers,
	listTeams,
	updateAdminUserRole,
	updateAdminUserStatus,
	validateAdminRoleUpdate,
	type AdminRoleUpdateInput,
	type AdminRoleUpdateValidationResult,
	type AdminUserRecord,
	type CreateCrmProfileInput,
	type CrmProfileStatusValue,
	type CrmRoleValue,
} from "./repositories/admin-users";

export {
	type AuthorizationScope,
	buildOwnerScopeFilter,
	canAccessOwnedRecord,
} from "./authorization/scope";
