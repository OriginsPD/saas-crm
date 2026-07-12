import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import { CompaniesListPanel } from "@/components/crm-records/companies-list-panel";
import { ContactsListPanel } from "@/components/crm-records/contacts-list-panel";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import { CompanyForm } from "@/components/forms/company-form";
import { ContactForm } from "@/components/forms/contact-form";
import type { CrmPermission } from "@/lib/crm-client";

const ADMIN_PERMISSIONS: CrmPermission[] = [
	"companies.view",
	"companies.create",
	"companies.edit",
	"companies.archive",
	"contacts.view",
	"contacts.create",
	"contacts.edit",
	"contacts.archive",
];

const REPRESENTATIVE_PERMISSIONS: CrmPermission[] = [
	"companies.view",
	"companies.create",
	"contacts.view",
	"contacts.create",
];

const sampleCompany = {
	id: "company-1",
	name: "Acme Corp",
	domain: "acme.example",
	industry: "Software",
	size: "smb" as const,
	status: "active" as const,
	ownerProfileId: "profile-1",
	notes: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

const sampleContact = {
	id: "contact-1",
	companyId: "company-1",
	firstName: "Alex",
	lastName: "Nguyen",
	title: "CEO",
	email: "alex@acme.example",
	phone: null,
	status: "active" as const,
	ownerProfileId: "profile-1",
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("companies and contacts UI", () => {
	test("companies list shows scope badge and empty state", () => {
		render(
			<CompaniesListPanel
				companies={[]}
				scope="team_owned"
				permissions={ADMIN_PERMISSIONS}
			/>,
		);

		expect(screen.getByTestId("companies-list-panel")).toBeTruthy();
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Team-owned records",
		);
		expect(screen.getByTestId("companies-table-empty")).toBeTruthy();
		expect(screen.getByText("No companies in scope")).toBeTruthy();
	});

	test("contacts list filters rows with search", () => {
		render(
			<ContactsListPanel
				contacts={[sampleContact]}
				scope="own_assigned"
				permissions={REPRESENTATIVE_PERMISSIONS}
			/>,
		);

		expect(screen.getByText("Alex Nguyen")).toBeTruthy();

		fireEvent.change(screen.getByTestId("contacts-table-search"), {
			target: { value: "missing-person" },
		});

		expect(screen.getByTestId("contacts-table-empty")).toBeTruthy();
	});

	test("representative scope label differs from manager scope", () => {
		const { rerender } = render(<ScopeBadge scope="team_owned" />);
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Team-owned records",
		);

		rerender(<ScopeBadge scope="own_assigned" />);
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Assigned records",
		);
	});

	test("company form shows validation error for empty name", async () => {
		render(
			<CompanyForm
				submitLabel="Create company"
				onSubmit={async () => undefined}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Create company" }));

		expect(await screen.findByText("Company name is required.")).toBeTruthy();
	});

	test("contact form shows validation error when email and phone missing", async () => {
		render(
			<ContactForm
				submitLabel="Create contact"
				initialValues={{
					companyId: "company-1",
					firstName: "Alex",
					lastName: "Nguyen",
					title: "",
					email: "",
					phone: "",
					status: "active",
				}}
				companyOptions={[{ id: "company-1", name: "Acme Corp" }]}
				onSubmit={async () => undefined}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Create contact" }));

		expect(
			await screen.findAllByText("Email or phone is required."),
		).toHaveLength(2);
	});

	test("company form renders server validation banner", () => {
		render(
			<CompanyForm
				submitLabel="Save company"
				serverError="Unable to save company."
				onSubmit={async () => undefined}
			/>,
		);

		expect(screen.getByTestId("form-error-banner")).toBeTruthy();
		expect(screen.getByText("Unable to save company.")).toBeTruthy();
	});

	test("administrator list includes create action", () => {
		render(
			<CompaniesListPanel
				companies={[sampleCompany]}
				scope="all"
				permissions={ADMIN_PERMISSIONS}
			/>,
		);

		expect(screen.getByText("New company")).toBeTruthy();
		expect(screen.getByText("Acme Corp")).toBeTruthy();
	});
});
