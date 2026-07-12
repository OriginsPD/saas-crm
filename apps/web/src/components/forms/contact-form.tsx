import { Button } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";
import { useForm } from "@tanstack/react-form";
import z from "zod";

import type { ContactInput, ContactRecord } from "@/lib/crm-client";

import {
	FieldErrors,
	FormErrorBanner,
	normalizeFieldErrors,
} from "./field-errors";

const contactSchema = z
	.object({
		companyId: z.string().trim().min(1, "Company is required."),
		firstName: z.string().trim().min(1, "First name is required."),
		lastName: z.string().trim().min(1, "Last name is required."),
		title: z.string(),
		email: z.string(),
		phone: z.string(),
		status: z.enum(["active", "archived"]),
	})
	.superRefine((value, context) => {
		if (!value.email.trim() && !value.phone.trim()) {
			context.addIssue({
				code: "custom",
				message: "Email or phone is required.",
				path: ["email"],
			});
			context.addIssue({
				code: "custom",
				message: "Email or phone is required.",
				path: ["phone"],
			});
		}
	});

export type ContactFormValues = z.infer<typeof contactSchema>;

export function contactRecordToFormValues(
	contact?: ContactRecord,
	companyId?: string,
): ContactFormValues {
	return {
		companyId: contact?.companyId ?? companyId ?? "",
		firstName: contact?.firstName ?? "",
		lastName: contact?.lastName ?? "",
		title: contact?.title ?? "",
		email: contact?.email ?? "",
		phone: contact?.phone ?? "",
		status: contact?.status ?? "active",
	};
}

export function contactFormValuesToInput(
	values: ContactFormValues,
): ContactInput {
	return {
		companyId: values.companyId,
		firstName: values.firstName.trim(),
		lastName: values.lastName.trim(),
		title: values.title.trim() || null,
		email: values.email.trim() || null,
		phone: values.phone.trim() || null,
		status: values.status,
	};
}

type ContactFormProps = {
	initialValues?: ContactFormValues;
	submitLabel: string;
	onSubmit: (input: ContactInput) => Promise<void>;
	serverFieldErrors?: Record<string, string[]>;
	serverError?: string;
	disabled?: boolean;
	companyOptions?: Array<{ id: string; name: string }>;
	lockCompany?: boolean;
};

export function ContactForm({
	initialValues = contactRecordToFormValues(),
	submitLabel,
	onSubmit,
	serverFieldErrors,
	serverError,
	disabled = false,
	companyOptions = [],
	lockCompany = false,
}: ContactFormProps) {
	const form = useForm({
		defaultValues: initialValues,
		onSubmit: async ({ value }) => {
			await onSubmit(contactFormValuesToInput(value));
		},
		validators: {
			onSubmit: contactSchema,
		},
	});

	return (
		<form
			className="space-y-5"
			data-testid="contact-form"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{serverError ? <FormErrorBanner message={serverError} /> : null}

			<form.Field name="companyId">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="contact-company">Company</Label>
						{lockCompany ? (
							<Input id="contact-company" value={field.state.value} disabled />
						) : (
							<select
								id="contact-company"
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
								aria-invalid={Boolean(
									field.state.meta.errors.length ||
										serverFieldErrors?.companyId,
								)}
							>
								<option value="">Select company</option>
								{companyOptions.map((company) => (
									<option key={company.id} value={company.id}>
										{company.name}
									</option>
								))}
							</select>
						)}
						<FieldErrors
							errors={[
								...normalizeFieldErrors(field.state.meta.errors),
								...(serverFieldErrors?.companyId ?? []),
							]}
						/>
					</div>
				)}
			</form.Field>

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="firstName">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="contact-first-name">First name</Label>
							<Input
								id="contact-first-name"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
								aria-invalid={Boolean(
									field.state.meta.errors.length ||
										serverFieldErrors?.firstName,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.firstName ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="lastName">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="contact-last-name">Last name</Label>
							<Input
								id="contact-last-name"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
								aria-invalid={Boolean(
									field.state.meta.errors.length || serverFieldErrors?.lastName,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.lastName ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<form.Field name="title">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="contact-title">Title</Label>
						<Input
							id="contact-title"
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
						/>
					</div>
				)}
			</form.Field>

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="contact-email">Email</Label>
							<Input
								id="contact-email"
								type="email"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
								aria-invalid={Boolean(
									field.state.meta.errors.length || serverFieldErrors?.email,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.email ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="phone">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="contact-phone">Phone</Label>
							<Input
								id="contact-phone"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled}
								aria-invalid={Boolean(
									field.state.meta.errors.length || serverFieldErrors?.phone,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.phone ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<form.Field name="status">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="contact-status">Status</Label>
						<select
							id="contact-status"
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
							value={field.state.value}
							onChange={(event) =>
								field.handleChange(
									event.target.value as ContactFormValues["status"],
								)
							}
							disabled={disabled}
						>
							<option value="active">Active</option>
							<option value="archived">Archived</option>
						</select>
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
