import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { CompanyForm } from "@/components/forms/company-form";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import {
	createCompany,
	hasCrmPermission,
	type CrmRequestError,
} from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/companies/new")({
	component: NewCompanyPage,
});

function NewCompanyPage() {
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();

	if (!hasCrmPermission(crmProfile.permissions, "companies.create")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to create companies.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
			<div className="space-y-2">
				<Link
					to="/companies"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					← Back to companies
				</Link>
				<h1 className="font-semibold text-2xl tracking-tight">New company</h1>
				<p className="text-muted-foreground text-sm">
					Create an account record in your workspace scope.
				</p>
				<ScopeBadge scope={crmProfile.viewScopes.companies ?? "deny"} />
			</div>

			<CompanyForm
				submitLabel="Create company"
				serverFieldErrors={fieldErrors}
				serverError={serverError}
				onSubmit={async (input) => {
					setFieldErrors(undefined);
					setServerError(undefined);

					try {
						const company = await createCompany(input);
						toast.success("Company created");
						await navigate({
							to: "/companies/$companyId",
							params: { companyId: company.id },
						});
					} catch (error) {
						const requestError = error as CrmRequestError;

						if (requestError.fieldErrors) {
							setFieldErrors(requestError.fieldErrors);
							return;
						}

						setServerError(requestError.message);
					}
				}}
			/>
		</div>
	);
}
