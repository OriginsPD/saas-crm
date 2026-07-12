import { describe, expect, test } from "bun:test";
import { getTableColumns, getTableName, is } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";

import {
	canAccessOwnedRecord,
	type AuthorizationScope,
} from "../authorization/scope";
import { buildCompanyListQuery } from "../repositories/companies";
import {
	validateContactInput,
	buildContactListQuery,
} from "../repositories/contacts";
import {
	company,
	companySizeEnum,
	companyStatusEnum,
	contact,
	contactStatusEnum,
	crmProfile,
} from "../schema/crm";

describe("company and contact schema", () => {
	test("exports company and contact tables", () => {
		expect(is(company, PgTable)).toBe(true);
		expect(is(contact, PgTable)).toBe(true);
		expect(getTableName(company)).toBe("company");
		expect(getTableName(contact)).toBe("contact");
	});

	test("models company and contact enums", () => {
		expect(companySizeEnum.enumValues).toEqual([
			"startup",
			"smb",
			"mid_market",
			"enterprise",
		]);
		expect(companyStatusEnum.enumValues).toEqual([
			"prospect",
			"active",
			"archived",
		]);
		expect(contactStatusEnum.enumValues).toEqual(["active", "archived"]);
	});

	test("links company and contact ownership to CRM profiles", () => {
		const companyColumns = getTableColumns(company);
		const contactColumns = getTableColumns(contact);
		const companyForeignKeys = getTableConfig(company).foreignKeys;
		const contactForeignKeys = getTableConfig(contact).foreignKeys;

		expect(companyColumns.name.notNull).toBe(true);
		expect(companyColumns.ownerProfileId.notNull).toBe(true);
		expect(contactColumns.firstName.notNull).toBe(true);
		expect(contactColumns.lastName.notNull).toBe(true);
		expect(
			companyForeignKeys.some(
				(foreignKey) => foreignKey.reference().foreignTable === crmProfile,
			),
		).toBe(true);
		expect(
			contactForeignKeys.some(
				(foreignKey) => foreignKey.reference().foreignTable === company,
			),
		).toBe(true);
	});
});

describe("contact validation", () => {
	test("requires first and last name", () => {
		const result = validateContactInput({
			companyId: "company-1",
			firstName: "",
			lastName: "Nguyen",
			email: "alex@example.com",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.firstName).toContain("First name is required.");
		}
	});

	test("requires email or phone", () => {
		const result = validateContactInput({
			companyId: "company-1",
			firstName: "Alex",
			lastName: "Nguyen",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.email).toContain("Email or phone is required.");
			expect(result.fieldErrors.phone).toContain("Email or phone is required.");
		}
	});

	test("accepts phone-only contacts", () => {
		const result = validateContactInput({
			companyId: "company-1",
			firstName: "Alex",
			lastName: "Nguyen",
			phone: "+1 555 0100",
		});

		expect(result.valid).toBe(true);
	});
});

describe("authorization scope helpers", () => {
	const representativeScope: AuthorizationScope = {
		access: "own_assigned",
		actorProfileId: "profile-rep-a",
		actorTeamId: "team-a",
	};

	const managerScope: AuthorizationScope = {
		access: "team_owned",
		actorProfileId: "profile-manager-a",
		actorTeamId: "team-a",
	};

	test("own_assigned scope allows only actor-owned records", () => {
		expect(
			canAccessOwnedRecord(representativeScope, "profile-rep-a", "team-a"),
		).toBe(true);
		expect(
			canAccessOwnedRecord(representativeScope, "profile-rep-b", "team-b"),
		).toBe(false);
	});

	test("team_owned scope allows team member records", () => {
		expect(canAccessOwnedRecord(managerScope, "profile-rep-a", "team-a")).toBe(
			true,
		);
		expect(canAccessOwnedRecord(managerScope, "profile-rep-b", "team-b")).toBe(
			false,
		);
	});

	test("company list query includes scope predicate for representatives", () => {
		const query = buildCompanyListQuery(representativeScope).toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.params).toContain("profile-rep-a");
	});

	test("contact list query includes scope predicate for managers", () => {
		const query = buildContactListQuery(managerScope, "company-1").toSQL();

		expect(query.sql).toContain("owner_profile_id");
		expect(query.sql).toContain("company_id");
		expect(query.params).toContain("team-a");
		expect(query.params).toContain("company-1");
	});
});
