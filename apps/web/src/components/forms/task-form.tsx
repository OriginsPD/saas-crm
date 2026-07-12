import { Button } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";
import { useForm } from "@tanstack/react-form";
import z from "zod";

import type { TaskInput, TaskPriority, TaskRecord } from "@/lib/crm-client";

import {
	FieldErrors,
	FormErrorBanner,
	normalizeFieldErrors,
} from "./field-errors";

const taskSchema = z.object({
	title: z.string().trim().min(1, "Task title is required."),
	description: z.string(),
	assigneeProfileId: z.string().trim().min(1, "Assignee is required."),
	relatedCompanyId: z.string(),
	relatedContactId: z.string(),
	relatedDealId: z.string(),
	dueDate: z.string(),
	priority: z.enum(["low", "medium", "high"]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export function taskRecordToFormValues(
	task?: TaskRecord,
	defaults?: Partial<TaskFormValues>,
): TaskFormValues {
	return {
		title: task?.title ?? "",
		description: task?.description ?? "",
		assigneeProfileId:
			task?.assigneeProfileId ?? defaults?.assigneeProfileId ?? "",
		relatedCompanyId:
			task?.relatedCompanyId ?? defaults?.relatedCompanyId ?? "",
		relatedContactId:
			task?.relatedContactId ?? defaults?.relatedContactId ?? "",
		relatedDealId: task?.relatedDealId ?? defaults?.relatedDealId ?? "",
		dueDate: task?.dueDate ?? defaults?.dueDate ?? "",
		priority: task?.priority ?? defaults?.priority ?? "medium",
	};
}

export function taskFormValuesToInput(values: TaskFormValues): TaskInput {
	return {
		title: values.title.trim(),
		description: values.description.trim() || null,
		assigneeProfileId: values.assigneeProfileId.trim(),
		relatedCompanyId: values.relatedCompanyId.trim() || null,
		relatedContactId: values.relatedContactId.trim() || null,
		relatedDealId: values.relatedDealId.trim() || null,
		dueDate: values.dueDate.trim() || null,
		priority: values.priority as TaskPriority,
	};
}

type TaskFormProps = {
	initialValues?: TaskFormValues;
	submitLabel: string;
	onSubmit: (input: TaskInput) => Promise<void>;
	serverFieldErrors?: Record<string, string[]>;
	serverError?: string;
	disabled?: boolean;
	lockRelatedEntity?: boolean;
	companyOptions?: Array<{ id: string; name: string }>;
	dealOptions?: Array<{ id: string; title: string }>;
};

export function TaskForm({
	initialValues = taskRecordToFormValues(),
	submitLabel,
	onSubmit,
	serverFieldErrors,
	serverError,
	disabled = false,
	lockRelatedEntity = false,
	companyOptions = [],
	dealOptions = [],
}: TaskFormProps) {
	const form = useForm({
		defaultValues: initialValues,
		validators: {
			onSubmit: taskSchema,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(taskFormValuesToInput(value));
		},
	});

	return (
		<form
			className="space-y-4"
			data-testid="task-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			{serverError ? <FormErrorBanner message={serverError} /> : null}

			<form.Field name="title">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="task-title">Title</Label>
						<Input
							id="task-title"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
						/>
						<FieldErrors
							errors={[
								...normalizeFieldErrors(field.state.meta.errors),
								...(serverFieldErrors?.title ?? []),
							]}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="task-description">Description</Label>
						<Input
							id="task-description"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="dueDate">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="task-due-date">Due date</Label>
						<Input
							id="task-due-date"
							type="date"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							disabled={disabled}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="priority">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="task-priority">Priority</Label>
						<select
							id="task-priority"
							className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
							value={field.state.value}
							onChange={(event) =>
								field.handleChange(event.target.value as TaskPriority)
							}
							disabled={disabled}
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
				)}
			</form.Field>

			{companyOptions.length > 0 ? (
				<form.Field name="relatedCompanyId">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="task-company">Related company</Label>
							<select
								id="task-company"
								className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled || lockRelatedEntity}
							>
								<option value="">None</option>
								{companyOptions.map((company) => (
									<option key={company.id} value={company.id}>
										{company.name}
									</option>
								))}
							</select>
						</div>
					)}
				</form.Field>
			) : null}

			{dealOptions.length > 0 ? (
				<form.Field name="relatedDealId">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="task-deal">Related deal</Label>
							<select
								id="task-deal"
								className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								disabled={disabled || lockRelatedEntity}
							>
								<option value="">None</option>
								{dealOptions.map((deal) => (
									<option key={deal.id} value={deal.id}>
										{deal.title}
									</option>
								))}
							</select>
						</div>
					)}
				</form.Field>
			) : null}

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
