import { Button } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";
import { useForm } from "@tanstack/react-form";
import z from "zod";

import {
	USER_ACTIVITY_TYPES,
	type ActivityInput,
	type UserActivityType,
} from "@/lib/crm-client";

import {
	FieldErrors,
	FormErrorBanner,
	normalizeFieldErrors,
} from "@/components/forms/field-errors";

const activitySchema = z.object({
	type: z.enum(["note", "call", "email", "meeting"]),
	subject: z.string().trim().min(1, "Subject is required."),
	body: z.string(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

export function activityFormValuesToInput(
	values: ActivityFormValues,
	related: {
		relatedCompanyId?: string | null;
		relatedContactId?: string | null;
		relatedDealId?: string | null;
	},
): ActivityInput {
	return {
		type: values.type as UserActivityType,
		subject: values.subject.trim(),
		body: values.body.trim() || null,
		relatedCompanyId: related.relatedCompanyId ?? null,
		relatedContactId: related.relatedContactId ?? null,
		relatedDealId: related.relatedDealId ?? null,
	};
}

type ActivityFormProps = {
	submitLabel: string;
	onSubmit: (input: ActivityInput) => Promise<void>;
	serverFieldErrors?: Record<string, string[]>;
	serverError?: string;
	disabled?: boolean;
	relatedCompanyId?: string | null;
	relatedContactId?: string | null;
	relatedDealId?: string | null;
};

export function ActivityForm({
	submitLabel,
	onSubmit,
	serverFieldErrors,
	serverError,
	disabled = false,
	relatedCompanyId,
	relatedContactId,
	relatedDealId,
}: ActivityFormProps) {
	const form = useForm({
		defaultValues: {
			type: "note" as UserActivityType,
			subject: "",
			body: "",
		},
		validators: {
			onSubmit: activitySchema,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(
				activityFormValuesToInput(value, {
					relatedCompanyId,
					relatedContactId,
					relatedDealId,
				}),
			);
			form.reset();
		},
	});

	return (
		<form
			className="space-y-4"
			data-testid="activity-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			{serverError ? <FormErrorBanner message={serverError} /> : null}

			<form.Field name="type">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="activity-type">Type</Label>
						<select
							id="activity-type"
							className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
							value={field.state.value}
							onChange={(event) =>
								field.handleChange(event.target.value as UserActivityType)
							}
							disabled={disabled}
						>
							{USER_ACTIVITY_TYPES.map((type) => (
								<option key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</option>
							))}
						</select>
					</div>
				)}
			</form.Field>

			<form.Field name="subject">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="activity-subject">Subject</Label>
						<Input
							id="activity-subject"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
						/>
						<FieldErrors
							errors={[
								...normalizeFieldErrors(field.state.meta.errors),
								...(serverFieldErrors?.subject ?? []),
							]}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="body">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="activity-body">Details</Label>
						<Input
							id="activity-body"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
						/>
					</div>
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button
						type="submit"
						disabled={disabled || !canSubmit || isSubmitting}
					>
						{isSubmitting ? "Saving..." : submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
