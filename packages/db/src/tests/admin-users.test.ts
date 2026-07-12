import { describe, expect, test } from "bun:test";

import { validateAdminRoleUpdate } from "../repositories/admin-users";

describe("admin user validation", () => {
	test("rejects invalid CRM role", () => {
		const result = validateAdminRoleUpdate({
			role: "invalid" as "administrator",
		});

		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.fieldErrors.role).toContain("Invalid CRM role.");
		}
	});

	test("clears team for administrator role", () => {
		const result = validateAdminRoleUpdate({
			role: "administrator",
			teamId: "team-a",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.teamId).toBeNull();
		}
	});

	test("accepts manager role with team", () => {
		const result = validateAdminRoleUpdate({
			role: "sales_manager",
			teamId: "team-a",
		});

		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.value.role).toBe("sales_manager");
			expect(result.value.teamId).toBe("team-a");
		}
	});
});
