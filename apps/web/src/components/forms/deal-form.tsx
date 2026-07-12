import { Button } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";
import { useForm } from "@tanstack/react-form";
import z from "zod";

import {
	FieldErrors,
	FormErrorBanner,
	normalizeFieldErrors,
} from "./field-errors";
import {
	DEAL_STAGES,
	getDealStageLabel,
	isClosedDealStage,
	type DealInput,
	type DealRecord,
	type DealStage,
	type StageTransitionInput,
} from "@/lib/crm-client";

const dealSchema = z.object({
	companyId: z.string().trim().min(1, "Company is required."),
	title: z.string().trim().min(1, "Deal title is required."),
	valueDollars: z
		.string()
		.trim()
		.min(1, "Deal value is required.")
		.refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
			message: "Deal value must be a non-negative number.",
		}),
	probability: z
		.string()
		.trim()
		.min(1, "Probability is required.")
		.refine((value) => {
			const parsed = Number(value);
			return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;
		}, "Probability must be between 0 and 100."),
	stage: z.enum(DEAL_STAGES),
	expectedCloseDate: z.string(),
});

export type DealFormValues = z.infer<typeof dealSchema>;

export function dealRecordToFormValues(
	deal?: DealRecord,
	companyId?: string,
): DealFormValues {
	return {
		companyId: deal?.companyId ?? companyId ?? "",
		title: deal?.title ?? "",
		valueDollars: deal ? String(deal.valueCents / 100) : "",
		probability: deal ? String(deal.probability) : "25",
		stage: deal?.stage ?? "prospecting",
		expectedCloseDate: deal?.expectedCloseDate ?? "",
	};
}

export function dealFormValuesToInput(values: DealFormValues): DealInput {
	return {
		companyId: values.companyId,
		title: values.title.trim(),
		valueCents: Math.round(Number(values.valueDollars) * 100),
		probability: Number(values.probability),
		stage: values.stage,
		expectedCloseDate: values.expectedCloseDate.trim() || null,
	};
}

type DealFormProps = {
	initialValues?: DealFormValues;
	submitLabel: string;
	onSubmit: (input: DealInput) => Promise<void>;
	serverFieldErrors?: Record<string, string[]>;
	serverError?: string;
	companyOptions?: Array<{ id: string; name: string }>;
	lockCompany?: boolean;
};

export function DealForm({
	initialValues = dealRecordToFormValues(),
	submitLabel,
	onSubmit,
	serverFieldErrors,
	serverError,
	companyOptions = [],
	lockCompany = false,
}: DealFormProps) {
	const form = useForm({
		defaultValues: initialValues,
		onSubmit: async ({ value }) => {
			await onSubmit(dealFormValuesToInput(value));
		},
		validators: {
			onSubmit: dealSchema,
		},
	});

	return (
		<form
			className="space-y-5"
			data-testid="deal-form"
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
						<Label htmlFor="deal-company">Company</Label>
						{lockCompany ? (
							<Input id="deal-company" value={field.state.value} disabled />
						) : (
							<select
								id="deal-company"
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
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

			<form.Field name="title">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="deal-title">Title</Label>
						<Input
							id="deal-title"
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
							aria-invalid={Boolean(
								field.state.meta.errors.length || serverFieldErrors?.title,
							)}
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

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="valueDollars">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="deal-value">Value (USD)</Label>
							<Input
								id="deal-value"
								inputMode="decimal"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								aria-invalid={Boolean(
									field.state.meta.errors.length ||
										serverFieldErrors?.valueCents,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.valueCents ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="probability">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="deal-probability">Probability (%)</Label>
							<Input
								id="deal-probability"
								inputMode="numeric"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								aria-invalid={Boolean(
									field.state.meta.errors.length ||
										serverFieldErrors?.probability,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.probability ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="stage">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="deal-stage">Stage</Label>
							<select
								id="deal-stage"
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.target.value as DealStage)
								}
							>
								{DEAL_STAGES.map((stage) => (
									<option key={stage} value={stage}>
										{getDealStageLabel(stage)}
									</option>
								))}
							</select>
						</div>
					)}
				</form.Field>

				<form.Field name="expectedCloseDate">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="deal-expected-close">Expected close date</Label>
							<Input
								id="deal-expected-close"
								type="date"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								aria-invalid={Boolean(
									field.state.meta.errors.length ||
										serverFieldErrors?.expectedCloseDate,
								)}
							/>
							<FieldErrors
								errors={[
									...normalizeFieldErrors(field.state.meta.errors),
									...(serverFieldErrors?.expectedCloseDate ?? []),
								]}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting}>
						{submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}

const stageTransitionSchema = z
	.object({
		stage: z.enum(DEAL_STAGES),
		expectedCloseDate: z.string(),
		lossReason: z.string(),
	})
	.superRefine((value, context) => {
		if (isClosedDealStage(value.stage) && !value.expectedCloseDate.trim()) {
			context.addIssue({
				code: "custom",
				message: "Expected close date is required before closing a deal.",
				path: ["expectedCloseDate"],
			});
		}

		if (value.stage === "closed_lost" && !value.lossReason.trim()) {
			context.addIssue({
				code: "custom",
				message: "Loss reason is required for closed-lost deals.",
				path: ["lossReason"],
			});
		}
	});

type DealStageFormProps = {
	currentStage: DealStage;
	expectedCloseDate?: string | null;
	submitLabel: string;
	onSubmit: (input: StageTransitionInput) => Promise<void>;
	serverFieldErrors?: Record<string, string[]>;
	serverError?: string;
	disabled?: boolean;
};

export function DealStageForm({
	currentStage,
	expectedCloseDate,
	submitLabel,
	onSubmit,
	serverFieldErrors,
	serverError,
	disabled = false,
}: DealStageFormProps) {
	const form = useForm({
		defaultValues: {
			stage: currentStage,
			expectedCloseDate: expectedCloseDate ?? "",
			lossReason: "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit({
				stage: value.stage,
				expectedCloseDate: value.expectedCloseDate.trim() || null,
				lossReason: value.lossReason.trim() || null,
			});
		},
		validators: {
			onSubmit: stageTransitionSchema,
		},
	});

	return (
		<form
			className="space-y-4"
			data-testid="deal-stage-form"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{serverError ? <FormErrorBanner message={serverError} /> : null}

			<form.Field name="stage">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="deal-next-stage">Next stage</Label>
						<select
							id="deal-next-stage"
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
							value={field.state.value}
							onChange={(event) =>
								field.handleChange(event.target.value as DealStage)
							}
							disabled={disabled}
						>
							{DEAL_STAGES.map((stage) => (
								<option key={stage} value={stage}>
									{getDealStageLabel(stage)}
								</option>
							))}
						</select>
					</div>
				)}
			</form.Field>

			<form.Subscribe selector={(state) => state.values.stage}>
				{(stage) =>
					isClosedDealStage(stage) ? (
						<>
							<form.Field name="expectedCloseDate">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor="deal-close-date">Expected close date</Label>
										<Input
											id="deal-close-date"
											type="date"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											disabled={disabled}
											aria-invalid={Boolean(
												field.state.meta.errors.length ||
													serverFieldErrors?.expectedCloseDate,
											)}
										/>
										<FieldErrors
											errors={[
												...normalizeFieldErrors(field.state.meta.errors),
												...(serverFieldErrors?.expectedCloseDate ?? []),
											]}
										/>
									</div>
								)}
							</form.Field>

							{stage === "closed_lost" ? (
								<form.Field name="lossReason">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="deal-loss-reason">Loss reason</Label>
											<Input
												id="deal-loss-reason"
												value={field.state.value}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												disabled={disabled}
												aria-invalid={Boolean(
													field.state.meta.errors.length ||
														serverFieldErrors?.lossReason,
												)}
											/>
											<FieldErrors
												errors={[
													...normalizeFieldErrors(field.state.meta.errors),
													...(serverFieldErrors?.lossReason ?? []),
												]}
											/>
										</div>
									)}
								</form.Field>
							) : null}
						</>
					) : null
				}
			</form.Subscribe>

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
