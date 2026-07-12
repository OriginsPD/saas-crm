import { describe, expect, test } from "bun:test";

import {
	DEMO_ACCOUNTS,
	DEMO_ACTIVITIES,
	DEMO_COMPANIES,
	DEMO_CONTACTS,
	DEMO_DEALS,
	DEMO_TASKS,
	DEMO_TEAM,
	getSeedSummary,
} from "../../seed/fixtures";

describe("CRM demo seed fixtures integration", () => {
	test("fixture summary matches entity counts", () => {
		expect(getSeedSummary()).toEqual({
			teams: 1,
			accounts: DEMO_ACCOUNTS.length,
			companies: DEMO_COMPANIES.length,
			contacts: DEMO_CONTACTS.length,
			deals: DEMO_DEALS.length,
			tasks: DEMO_TASKS.length,
			activities: DEMO_ACTIVITIES.length,
		});
	});

	test("demo accounts match quickstart roles and emails", () => {
		expect(DEMO_ACCOUNTS.map((account) => account.email)).toEqual([
			"admin@example.test",
			"manager@example.test",
			"rep@example.test",
		]);
		expect(DEMO_ACCOUNTS.map((account) => account.role)).toEqual([
			"administrator",
			"sales_manager",
			"sales_representative",
		]);
	});

	test("seed graph references valid company and owner keys", () => {
		const companyIds = new Set(DEMO_COMPANIES.map((item) => item.id));

		for (const contactSeed of DEMO_CONTACTS) {
			expect(companyIds.has(contactSeed.companyId)).toBe(true);
		}

		for (const dealSeed of DEMO_DEALS) {
			expect(companyIds.has(dealSeed.companyId)).toBe(true);
			for (const contactId of dealSeed.contactIds) {
				expect(DEMO_CONTACTS.some((item) => item.id === contactId)).toBe(true);
			}
		}
	});

	test("seed team id is stable marker", () => {
		expect(DEMO_TEAM.id.startsWith("seed-")).toBe(true);
		expect(DEMO_TEAM.name.length).toBeGreaterThan(0);
	});
});
