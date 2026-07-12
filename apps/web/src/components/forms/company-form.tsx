import { Button } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";
import { Textarea } from "@portfolio-saas-crm/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import z from "zod";

import type { CompanyInput, CompanyRecord } from "@/lib/crm-client";

import {
	FieldErrors,
	FormErrorBanner,
	normalizeFieldErrors,
} from "./field-errors";

const companySchema = z.object({
	name: z.string().trim().min(1, "Company name is required."),
	domain: z.string(),
	industry: z.string(),
	size: z.enum(["startup", "smb", "mid_market", "enterprise", ""]),
	status: z.enum(["prospect", "active", "archived"]),
	notes: z.string(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export function companyRecordToFormValues(
	company?: CompanyRecord,
): CompanyFormValues {
	return {
		name: company?.name ?? "",
		domain: company?.domain ?? "",
		industry: company?.industry ?? "",
		size: company?.size ?? "",
		status: company?.status ?? "prospect",
		notes: company?.notes ?? "",
	};
}

export function companyFormValuesToInput(
	values: CompanyFormValues,
): CompanyInput {
	return {
		name: values.name.trim(),
		domain: values.domain.trim() || null,
		industry: values.industry.trim() || null,
		size: values.size || null,
		status: values.status,
		notes: values.notes.trim() || null,
	};
}

type CompanyFormProps = {
	initialValues?: CompanyFormValues;
	submitLabel: string;
	onSubmit: (input: CompanyInput) => Promise<void>;
	serverFieldErrors?: Record<string, string[]>;
	serverError?: string;
	disabled?: boolean;
};

export function CompanyForm({
	initialValues = companyRecordToFormValues(),
	submitLabel,
	onSubmit,
	serverFieldErrors,
	serverError,
	disabled = false,
}: CompanyFormProps) {
	const form = useForm({
		defaultValues: initialValues,
		onSubmit: async ({ value }) => {
			await onSubmit(companyFormValuesToInput(value));
		},
		validators: {
			onSubmit: companySchema,
		},
	});

	return (
		<form
			className="space-y-5"
			data-testid="company-form"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{serverError ? <FormErrorBanner message={serverError} /> : null}

			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="company-name">Company name</Label>
						<Input
							id="company-name"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
							aria-invalid={Boolean(
								field.state.meta.errors.length || serverFieldErrors?.name,
							)}
						/>
						<FieldErrors
							errors={[
								...normalizeFieldErrors(field.state.meta.errors),
								...(serverFieldErrors?.name ?? []),
							]}
						/>
					</div>
				)}
			</form.Field>

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="domain">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="company-domain">Domain</Label>
							<Input
								id="company-domain"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="industry">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="company-industry">Industry</Label>
							<Input
								id="company-industry"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="size">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="company-size">Size</Label>
							<select
								id="company-size"
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(
										event.target.value as CompanyFormValues["size"],
									)
								}
								disabled={disabled}
							>
								<option value="">Select size</option>
								<option value="startup">Startup</option>
								<option value="smb">SMB</option>
								<option value="mid_market">Mid-market</option>
								<option value="enterprise">Enterprise</option>
							</select>
						</div>
					)}
				</form.Field>

				<form.Field name="status">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="company-status">Status</Label>
							<select
								id="company-status"
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(
										event.target.value as CompanyFormValues["status"],
									)
								}
								disabled={disabled}
							>
								<option value="prospect">Prospect</option>
								<option value="active">Active</option>
								<option value="archived">Archived</option>
							</select>
						</div>
					)}
				</form.Field>
			</div>

			<form.Field name="notes">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="company-notes">Notes</Label>
						<Textarea
							id="company-notes"
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
							rows={4}
						/>
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={disabled || isSubmitting}>
						{submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
