import type {
	AdminRoleUpdateInput,
	AdminRoleUpdateValidationResult,
	AdminUserRecord,
	CrmProfileStatusValue,
	CreateCrmProfileInput,
} from "@portfolio-saas-crm/db";
import {
	createCrmProfile,
	getAdminUserByProfileId,
	listAdminUsers,
	listTeams,
	updateAdminUserRole,
	updateAdminUserStatus,
} from "@portfolio-saas-crm/db";
import { Elysia } from "elysia";

import type { CrmAuthContext } from "../authz/context";
import { notFoundError, validationError } from "../shared/errors";
import { requireAdministrator } from "./guard";

export type CreateAdminUserInput = {
	name: string;
	email: string;
	password: string;
	role: CreateCrmProfileInput["role"];
	teamId?: string | null;
};

export type AdminUsersRouteDeps = {
	listAdminUsers: typeof listAdminUsers;
	listTeams: typeof listTeams;
	getAdminUserByProfileId: typeof getAdminUserByProfileId;
	updateAdminUserRole: typeof updateAdminUserRole;
	updateAdminUserStatus: typeof updateAdminUserStatus;
	createCrmProfile: typeof createCrmProfile;
	createAuthUser: (
		input: CreateAdminUserInput,
	) => Promise<{ userId: string } | { fieldErrors: Record<string, string[]> }>;
};

const defaultDeps: AdminUsersRouteDeps = {
	listAdminUsers,
	listTeams,
	getAdminUserByProfileId,
	updateAdminUserRole,
	updateAdminUserStatus,
	createCrmProfile,
	createAuthUser: async (input) => {
		const { auth } = await import("@portfolio-saas-crm/auth");

		try {
			const result = await auth.api.signUpEmail({
				body: {
					name: input.name,
					email: input.email,
					password: input.password,
				},
			});

			if (!result.user?.id) {
				return {
					fieldErrors: {
						email: ["Unable to create user account."],
					},
				};
			}

			return { userId: result.user.id };
		} catch {
			return {
				fieldErrors: {
					email: ["Unable to create user account."],
				},
			};
		}
	},
};

function handleRoleUpdateResult(
	result: AdminUserRecord | AdminRoleUpdateValidationResult,
): AdminUserRecord {
	if ("valid" in result && !result.valid) {
		validationError("Invalid role update.", result.fieldErrors);
	}

	return result as AdminUserRecord;
}

export function createAdminUsersRoutes(
	deps: AdminUsersRouteDeps = defaultDeps,
) {
	return new Elysia({ name: "admin-users-routes" })
		.get("/users", async (ctx) => {
			const { crmProfile } = ctx as typeof ctx & CrmAuthContext;
			requireAdministrator(crmProfile);

			const [items, teams] = await Promise.all([
				deps.listAdminUsers(),
				deps.listTeams(),
			]);

			return { items, teams };
		})
		.post("/users", async (ctx) => {
			const { crmProfile, body } = ctx as typeof ctx & CrmAuthContext;
			requireAdministrator(crmProfile);

			const input = body as CreateAdminUserInput;
			const authResult = await deps.createAuthUser(input);

			if ("fieldErrors" in authResult) {
				validationError("Invalid user input.", authResult.fieldErrors);
			}

			const profile = await deps.createCrmProfile({
				userId: authResult.userId,
				role: input.role,
				teamId: input.teamId,
			});

			const userRecord = await deps.getAdminUserByProfileId(profile.id);

			if (!userRecord) {
				notFoundError("Created user not found");
			}

			return userRecord;
		})
		.patch("/users/:id/role", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			requireAdministrator(crmProfile);

			const result = await deps.updateAdminUserRole(
				params.id,
				body as AdminRoleUpdateInput,
			);

			if (!result) {
				notFoundError("User not found");
			}

			return handleRoleUpdateResult(result);
		})
		.patch("/users/:id/status", async (ctx) => {
			const { crmProfile, params, body } = ctx as typeof ctx & CrmAuthContext;
			requireAdministrator(crmProfile);

			const statusValue = (body as { status?: CrmProfileStatusValue }).status;

			if (!statusValue) {
				validationError("Invalid status update.", {
					status: ["Status is required."],
				});
			}

			const result = await deps.updateAdminUserStatus(params.id, statusValue);

			if (!result) {
				notFoundError("User not found");
			}

			return result;
		});
}

export const adminUsersRoutes = createAdminUsersRoutes();
