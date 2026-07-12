import { env } from "@portfolio-saas-crm/env/web";

export type CrmRole =
	| "administrator"
	| "sales_manager"
	| "sales_representative";

export type CrmPermission =
	| "auth.sign_in_out"
	| "profile.view_own"
	| "users.manage"
	| "users.change_roles"
	| "users.disable"
	| "teams.view"
	| "teams.manage"
	| "companies.view"
	| "companies.create"
	| "companies.edit"
	| "companies.archive"
	| "contacts.view"
	| "contacts.create"
	| "contacts.edit"
	| "contacts.archive"
	| "deals.view"
	| "deals.create"
	| "deals.edit"
	| "deals.move_stage"
	| "deals.close"
	| "tasks.view"
	| "tasks.create"
	| "tasks.complete"
	| "activity.view"
	| "activity.create"
	| "reports.view"
	| "reports.export";

export type CrmViewScope = "all" | "team_owned" | "own_assigned" | "deny";

export type CrmMeResponse = {
	user: {
		id: string;
		name: string;
		email: string;
	};
	profile: {
		id: string;
		role: CrmRole;
		status: "active" | "disabled";
		teamId: string | null;
	};
	permissions: CrmPermission[];
	viewScopes: Record<string, CrmViewScope>;
};

export type CrmApiError = {
	code: "UNAUTHENTICATED" | "FORBIDDEN";
	message: string;
};

export type CrmValidationError = {
	code: "VALIDATION_ERROR";
	message: string;
	fieldErrors: Record<string, string[]>;
};

export type CrmNotFoundError = {
	code: "NOT_FOUND";
	message: string;
};

export type CompanySize = "startup" | "smb" | "mid_market" | "enterprise";
export type CompanyStatus = "prospect" | "active" | "archived";
export type ContactStatus = "active" | "archived";

export type CompanyRecord = {
	id: string;
	name: string;
	domain: string | null;
	industry: string | null;
	size: CompanySize | null;
	status: CompanyStatus;
	ownerProfileId: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ContactRecord = {
	id: string;
	companyId: string;
	firstName: string;
	lastName: string;
	title: string | null;
	email: string | null;
	phone: string | null;
	status: ContactStatus;
	ownerProfileId: string;
	createdAt: string;
	updatedAt: string;
};

export type CompanyDetailRecord = CompanyRecord & {
	contacts: ContactRecord[];
};

export type PaginatedList<T> = {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
};

export type CompanyInput = {
	name: string;
	domain?: string | null;
	industry?: string | null;
	size?: CompanySize | null;
	status?: CompanyStatus;
	notes?: string | null;
};

export type ContactInput = {
	companyId: string;
	firstName: string;
	lastName: string;
	title?: string | null;
	email?: string | null;
	phone?: string | null;
	status?: ContactStatus;
};

export const DEAL_STAGES = [
	"prospecting",
	"qualified",
	"proposal",
	"negotiation",
	"closed_won",
	"closed_lost",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export type DealRecord = {
	id: string;
	companyId: string;
	ownerProfileId: string;
	title: string;
	valueCents: number;
	currency: string;
	stage: DealStage;
	probability: number;
	expectedCloseDate: string | null;
	closedAt: string | null;
	lossReason: string | null;
	createdAt: string;
	updatedAt: string;
};

export type DealDetailRecord = DealRecord & {
	contactIds: string[];
};

export type PipelineStageTotal = {
	stage: DealStage;
	dealCount: number;
	totalValueCents: number;
};

export type DealInput = {
	companyId: string;
	title: string;
	valueCents: number;
	currency?: string;
	stage?: DealStage;
	probability: number;
	expectedCloseDate?: string | null;
	contactIds?: string[];
};

export type StageTransitionInput = {
	stage: DealStage;
	closedAt?: string | null;
	lossReason?: string | null;
	expectedCloseDate?: string | null;
};

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export const TASK_STATUSES = ["open", "completed"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskRecord = {
	id: string;
	title: string;
	description: string | null;
	assigneeProfileId: string;
	relatedCompanyId: string | null;
	relatedContactId: string | null;
	relatedDealId: string | null;
	dueDate: string | null;
	priority: TaskPriority;
	status: TaskStatus;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type TaskInput = {
	title: string;
	description?: string | null;
	assigneeProfileId: string;
	relatedCompanyId?: string | null;
	relatedContactId?: string | null;
	relatedDealId?: string | null;
	dueDate?: string | null;
	priority?: TaskPriority;
	status?: TaskStatus;
};

export const USER_ACTIVITY_TYPES = [
	"note",
	"call",
	"email",
	"meeting",
] as const;
export const ACTIVITY_TYPES = [
	...USER_ACTIVITY_TYPES,
	"stage_change",
	"task_completed",
] as const;

export type UserActivityType = (typeof USER_ACTIVITY_TYPES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityRecord = {
	id: string;
	type: ActivityType;
	subject: string;
	body: string | null;
	actorProfileId: string;
	relatedCompanyId: string | null;
	relatedContactId: string | null;
	relatedDealId: string | null;
	occurredAt: string;
	createdAt: string;
};

export type ActivityInput = {
	type: UserActivityType;
	subject: string;
	body?: string | null;
	relatedCompanyId?: string | null;
	relatedContactId?: string | null;
	relatedDealId?: string | null;
};

export function getTaskPriorityLabel(priority: TaskPriority): string {
	switch (priority) {
		case "low":
			return "Low";
		case "medium":
			return "Medium";
		case "high":
			return "High";
	}
}

export function getActivityTypeLabel(type: ActivityType): string {
	switch (type) {
		case "note":
			return "Note";
		case "call":
			return "Call";
		case "email":
			return "Email";
		case "meeting":
			return "Meeting";
		case "stage_change":
			return "Stage change";
		case "task_completed":
			return "Task completed";
	}
}

export function formatActivityTimestamp(value: string): string {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export type ReportFilters = {
	ownerProfileId?: string;
	fromDate?: string | null;
	toDate?: string | null;
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

function buildReportQuery(filters?: ReportFilters): string {
	const params = new URLSearchParams();

	if (filters?.ownerProfileId) {
		params.set("ownerProfileId", filters.ownerProfileId);
	}

	if (filters?.fromDate) {
		params.set("fromDate", filters.fromDate);
	}

	if (filters?.toDate) {
		params.set("toDate", filters.toDate);
	}

	const query = params.toString();

	return query ? `?${query}` : "";
}

export async function fetchPipelineReport(
	filters?: ReportFilters,
): Promise<PipelineReport> {
	return crmRequest(`/api/crm/reports/pipeline${buildReportQuery(filters)}`);
}

export async function fetchPerformanceReport(
	filters?: ReportFilters,
): Promise<PerformanceReport> {
	return crmRequest(`/api/crm/reports/performance${buildReportQuery(filters)}`);
}

export async function fetchTaskReport(
	filters?: ReportFilters,
): Promise<TaskReport> {
	return crmRequest(`/api/crm/reports/tasks${buildReportQuery(filters)}`);
}

export async function fetchDashboardReports(filters?: ReportFilters): Promise<{
	pipeline: PipelineReport;
	performance: PerformanceReport;
	tasks: TaskReport;
}> {
	const [pipeline, performance, tasks] = await Promise.all([
		fetchPipelineReport(filters),
		fetchPerformanceReport(filters),
		fetchTaskReport(filters),
	]);

	return { pipeline, performance, tasks };
}

export type AdminUserRecord = {
	userId: string;
	profileId: string;
	name: string;
	email: string;
	role: CrmRole;
	teamId: string | null;
	teamName: string | null;
	status: "active" | "disabled";
	createdAt: string;
	updatedAt: string;
};

export type AdminUsersResponse = {
	items: AdminUserRecord[];
	teams: Array<{ id: string; name: string }>;
};

export type AdminRoleUpdateInput = {
	role: CrmRole;
	teamId?: string | null;
};

export type CreateAdminUserInput = {
	name: string;
	email: string;
	password: string;
	role: CrmRole;
	teamId?: string | null;
};

export function getCrmRoleLabel(role: CrmRole): string {
	switch (role) {
		case "administrator":
			return "Administrator";
		case "sales_manager":
			return "Sales Manager";
		case "sales_representative":
			return "Sales Representative";
	}
}

export async function fetchAdminUsers(): Promise<AdminUsersResponse> {
	return crmRequest("/api/admin/users");
}

export async function createAdminUser(
	input: CreateAdminUserInput,
): Promise<AdminUserRecord> {
	return crmRequest("/api/admin/users", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function updateAdminUserRole(
	profileId: string,
	input: AdminRoleUpdateInput,
): Promise<AdminUserRecord> {
	return crmRequest(`/api/admin/users/${profileId}/role`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export async function updateAdminUserStatus(
	profileId: string,
	status: "active" | "disabled",
): Promise<AdminUserRecord> {
	return crmRequest(`/api/admin/users/${profileId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});
}

export function formatDealValue(valueCents: number, currency = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(valueCents / 100);
}

export function getDealStageLabel(stage: DealStage): string {
	switch (stage) {
		case "prospecting":
			return "Prospecting";
		case "qualified":
			return "Qualified";
		case "proposal":
			return "Proposal";
		case "negotiation":
			return "Negotiation";
		case "closed_won":
			return "Closed won";
		case "closed_lost":
			return "Closed lost";
	}
}

export function isClosedDealStage(stage: DealStage): boolean {
	return stage === "closed_won" || stage === "closed_lost";
}

function getApiBaseUrl() {
	const normalized = env.VITE_SERVER_URL.endsWith("/")
		? env.VITE_SERVER_URL.slice(0, -1)
		: env.VITE_SERVER_URL;

	if (normalized.startsWith("http")) {
		return normalized;
	}

	if (typeof window !== "undefined") {
		return `${window.location.origin}${normalized}`;
	}

	return `http://localhost:3000${normalized}`;
}

export async function fetchCrmMe(): Promise<CrmMeResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/crm/me`, {
		credentials: "include",
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const error = (await response.json()) as CrmApiError;
		throw Object.assign(new Error(error.message), {
			status: response.status,
			code: error.code,
		});
	}

	return response.json() as Promise<CrmMeResponse>;
}

export function hasCrmPermission(
	permissions: readonly CrmPermission[],
	permission: CrmPermission,
): boolean {
	return permissions.includes(permission);
}

export function getResourceScopeLabel(scope: CrmViewScope): string {
	switch (scope) {
		case "all":
			return "All records";
		case "team_owned":
			return "Team-owned records";
		case "own_assigned":
			return "Assigned records";
		default:
			return "No access";
	}
}

type CrmRequestError = Error & {
	status?: number;
	code?: string;
	fieldErrors?: Record<string, string[]>;
};

async function parseCrmResponse<T>(response: Response): Promise<T> {
	if (response.ok) {
		return response.json() as Promise<T>;
	}

	const errorBody = (await response.json()) as
		| CrmApiError
		| CrmValidationError
		| CrmNotFoundError;

	throw Object.assign(new Error(errorBody.message), {
		status: response.status,
		code: errorBody.code,
		fieldErrors:
			errorBody.code === "VALIDATION_ERROR" ? errorBody.fieldErrors : undefined,
	}) satisfies CrmRequestError;
}

async function crmRequest<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${getApiBaseUrl()}${path}`, {
		credentials: "include",
		headers: {
			Accept: "application/json",
			...(init?.body ? { "Content-Type": "application/json" } : {}),
			...init?.headers,
		},
		...init,
	});

	return parseCrmResponse<T>(response);
}

export async function fetchCompanies(): Promise<PaginatedList<CompanyRecord>> {
	return crmRequest("/api/crm/companies");
}

export async function fetchCompany(id: string): Promise<CompanyDetailRecord> {
	return crmRequest(`/api/crm/companies/${id}`);
}

export async function createCompany(
	input: CompanyInput,
): Promise<CompanyRecord> {
	return crmRequest("/api/crm/companies", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function updateCompany(
	id: string,
	input: Partial<CompanyInput>,
): Promise<CompanyRecord> {
	return crmRequest(`/api/crm/companies/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export async function archiveCompany(id: string): Promise<CompanyRecord> {
	return crmRequest(`/api/crm/companies/${id}/archive`, {
		method: "POST",
	});
}

export async function fetchContacts(options?: {
	companyId?: string;
}): Promise<PaginatedList<ContactRecord>> {
	const query = options?.companyId
		? `?companyId=${encodeURIComponent(options.companyId)}`
		: "";

	return crmRequest(`/api/crm/contacts${query}`);
}

export async function fetchContact(id: string): Promise<ContactRecord> {
	return crmRequest(`/api/crm/contacts/${id}`);
}

export async function createContact(
	input: ContactInput,
): Promise<ContactRecord> {
	return crmRequest("/api/crm/contacts", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function updateContact(
	id: string,
	input: Partial<ContactInput>,
): Promise<ContactRecord> {
	return crmRequest(`/api/crm/contacts/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export async function archiveContact(id: string): Promise<ContactRecord> {
	return crmRequest(`/api/crm/contacts/${id}/archive`, {
		method: "POST",
	});
}

export async function fetchDeals(options?: {
	companyId?: string;
	stage?: DealStage;
}): Promise<PaginatedList<DealRecord>> {
	const params = new URLSearchParams();

	if (options?.companyId) {
		params.set("companyId", options.companyId);
	}

	if (options?.stage) {
		params.set("stage", options.stage);
	}

	const query = params.toString();

	return crmRequest(`/api/crm/deals${query ? `?${query}` : ""}`);
}

export async function fetchDealPipeline(): Promise<{
	stages: PipelineStageTotal[];
}> {
	return crmRequest("/api/crm/deals/pipeline");
}

export async function fetchDeal(id: string): Promise<DealDetailRecord> {
	return crmRequest(`/api/crm/deals/${id}`);
}

export async function createDeal(input: DealInput): Promise<DealRecord> {
	return crmRequest("/api/crm/deals", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function updateDeal(
	id: string,
	input: Partial<DealInput>,
): Promise<DealRecord> {
	return crmRequest(`/api/crm/deals/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export async function moveDealStage(
	id: string,
	input: StageTransitionInput,
): Promise<DealRecord> {
	return crmRequest(`/api/crm/deals/${id}/stage`, {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function fetchTasks(options?: {
	status?: TaskStatus;
	assigneeProfileId?: string;
	relatedCompanyId?: string;
	relatedContactId?: string;
	relatedDealId?: string;
}): Promise<PaginatedList<TaskRecord>> {
	const params = new URLSearchParams();

	if (options?.status) {
		params.set("status", options.status);
	}

	if (options?.assigneeProfileId) {
		params.set("assigneeProfileId", options.assigneeProfileId);
	}

	if (options?.relatedCompanyId) {
		params.set("relatedCompanyId", options.relatedCompanyId);
	}

	if (options?.relatedContactId) {
		params.set("relatedContactId", options.relatedContactId);
	}

	if (options?.relatedDealId) {
		params.set("relatedDealId", options.relatedDealId);
	}

	const query = params.toString();

	return crmRequest(`/api/crm/tasks${query ? `?${query}` : ""}`);
}

export async function fetchTask(id: string): Promise<TaskRecord> {
	return crmRequest(`/api/crm/tasks/${id}`);
}

export async function createTask(input: TaskInput): Promise<TaskRecord> {
	return crmRequest("/api/crm/tasks", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function updateTask(
	id: string,
	input: Partial<TaskInput>,
): Promise<TaskRecord> {
	return crmRequest(`/api/crm/tasks/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export async function completeTask(id: string): Promise<TaskRecord> {
	return crmRequest(`/api/crm/tasks/${id}/complete`, {
		method: "POST",
	});
}

export async function reopenTask(id: string): Promise<TaskRecord> {
	return crmRequest(`/api/crm/tasks/${id}/reopen`, {
		method: "POST",
	});
}

export async function fetchActivities(options?: {
	relatedCompanyId?: string;
	relatedContactId?: string;
	relatedDealId?: string;
	type?: ActivityType;
}): Promise<PaginatedList<ActivityRecord>> {
	const params = new URLSearchParams();

	if (options?.relatedCompanyId) {
		params.set("relatedCompanyId", options.relatedCompanyId);
	}

	if (options?.relatedContactId) {
		params.set("relatedContactId", options.relatedContactId);
	}

	if (options?.relatedDealId) {
		params.set("relatedDealId", options.relatedDealId);
	}

	if (options?.type) {
		params.set("type", options.type);
	}

	const query = params.toString();

	return crmRequest(`/api/crm/activity${query ? `?${query}` : ""}`);
}

export async function createActivity(
	input: ActivityInput,
): Promise<ActivityRecord> {
	return crmRequest("/api/crm/activity", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export type { CrmRequestError };
