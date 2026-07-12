import { describe, expect, test } from "bun:test";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";

import { user } from "../schema/auth";
import {
	crmProfile,
	crmProfileStatusEnum,
	crmRoleEnum,
	team,
} from "../schema/crm";

function getForeignKeyTargets(table: typeof crmProfile | typeof team) {
	const config = getTableConfig(table);

	return config.foreignKeys.map((foreignKey) => {
		const reference = foreignKey.reference();

		return {
			columns: reference.columns.map((column) => column.name),
			foreignTable: reference.foreignTable,
		};
	});
}

describe("CRM schema", () => {
	test("exports team and crmProfile tables", () => {
		expect(is(team, PgTable)).toBe(true);
		expect(is(crmProfile, PgTable)).toBe(true);
		expect(getTableName(team)).toBe("team");
		expect(getTableName(crmProfile)).toBe("crm_profile");
	});

	test("models role and status enums", () => {
		expect(crmRoleEnum.enumValues).toEqual([
			"administrator",
			"sales_manager",
			"sales_representative",
		]);
		expect(crmProfileStatusEnum.enumValues).toEqual(["active", "disabled"]);
	});

	test("links crmProfile to Better Auth user", () => {
		const columns = getTableColumns(crmProfile);
		const foreignKeys = getForeignKeyTargets(crmProfile);
		const userForeignKey = foreignKeys.find((foreignKey) =>
			foreignKey.columns.includes("user_id"),
		);

		expect(columns.userId.notNull).toBe(true);
		expect(columns.userId.isUnique).toBe(true);
		expect(userForeignKey?.foreignTable).toBe(user);
	});

	test("models team membership and manager reference", () => {
		const profileColumns = getTableColumns(crmProfile);
		const teamColumns = getTableColumns(team);
		const profileForeignKeys = getForeignKeyTargets(crmProfile);
		const teamForeignKeys = getForeignKeyTargets(team);
		const teamForeignKey = profileForeignKeys.find((foreignKey) =>
			foreignKey.columns.includes("team_id"),
		);
		const managerForeignKey = teamForeignKeys.find((foreignKey) =>
			foreignKey.columns.includes("manager_profile_id"),
		);

		expect(profileColumns.teamId.notNull).toBe(false);
		expect(teamForeignKey?.foreignTable).toBe(team);
		expect(teamColumns.managerProfileId.notNull).toBe(false);
		expect(managerForeignKey?.foreignTable).toBe(crmProfile);
		expect(teamColumns.name.notNull).toBe(true);
		expect(teamColumns.name.isUnique).toBe(true);
	});
});
