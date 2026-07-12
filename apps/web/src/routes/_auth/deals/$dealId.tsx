import { Button } from "@portfolio-saas-crm/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	DealForm,
	DealStageForm,
	dealRecordToFormValues,
} from "@/components/forms/deal-form";
import { DealStageBadge } from "@/components/pipeline/pipeline-board";
import {
	fetchActivities,
	fetchCompanies,
	fetchDeal,
	fetchTasks,
	formatDealValue,
	hasCrmPermission,
	isClosedDealStage,
	moveDealStage,
	updateDeal,
	type CrmRequestError,
} from "@/lib/crm-client";
import { EntityTimelinePanel } from "@/components/activity/entity-timeline-panel";

export const Route = createFileRoute("/_auth/deals/$dealId")({
	component: DealDetailPage,
});

function DealDetailPage() {
	const { dealId } = Route.useParams();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const [stageFieldErrors, setStageFieldErrors] =
		useState<Record<string, string[]>>();
	const [stageServerError, setStageServerError] = useState<string>();
	const [isEditing, setIsEditing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const dealState = useAsyncResource(
		() => fetchDeal(dealId),
		[dealId, refreshKey],
	);
	const companiesState = useAsyncResource(() => fetchCompanies(), []);
	const timelineState = useAsyncResource(async () => {
		const [activities, tasks] = await Promise.all([
			fetchActivities({ relatedDealId: dealId }),
			fetchTasks({ relatedDealId: dealId }),
		]);

		return {
			activities: activities.items,
			tasks: tasks.items,
		};
	}, [dealId, refreshKey]);

	const canEdit = hasCrmPermission(crmProfile.permissions, "deals.edit");
	const canMoveStage = hasCrmPermission(
		crmProfile.permissions,
		"deals.move_stage",
	);

	if (
		dealState.status === "loading" ||
		companiesState.status === "loading" ||
		timelineState.status === "loading"
	) {
		return <RecordPageLoadingState />;
	}

	if (dealState.status === "error") {
		return <RecordPageError message={dealState.message} />;
	}

	if (companiesState.status === "error") {
		return <RecordPageError message={companiesState.message} />;
	}

	if (timelineState.status === "error") {
		return <RecordPageError message={timelineState.message} />;
	}

	const dealRecord = dealState.data;
	const company = companiesState.data.items.find(
		(item) => item.id === dealRecord.companyId,
	);

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<Link
						to="/deals"
						className="text-muted-foreground text-sm hover:text-foreground"
					>
						← Back to pipeline
					</Link>
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="font-semibold text-2xl tracking-tight">
							{dealRecord.title}
						</h1>
						<DealStageBadge stage={dealRecord.stage} />
					</div>
					<p className="text-muted-foreground text-sm">
						{formatDealValue(dealRecord.valueCents, dealRecord.currency)} ·{" "}
						{dealRecord.probability}% · {company?.name ?? "Unknown company"}
					</p>
					<ScopeBadge scope={crmProfile.viewScopes.deals ?? "deny"} />
				</div>

				{canEdit ? (
					<Button
						variant="outline"
						onClick={() => {
							setIsEditing((value) => !value);
							setFieldErrors(undefined);
							setServerError(undefined);
						}}
					>
						{isEditing ? "Cancel edit" : "Edit deal"}
					</Button>
				) : null}
			</div>

			{isEditing && canEdit ? (
				<Card>
					<CardHeader>
						<CardTitle>Edit deal</CardTitle>
					</CardHeader>
					<CardContent>
						<DealForm
							initialValues={dealRecordToFormValues(dealRecord)}
							submitLabel="Save deal"
							lockCompany
							companyOptions={companiesState.data.items.map((item) => ({
								id: item.id,
								name: item.name,
							}))}
							serverFieldErrors={fieldErrors}
							serverError={serverError}
							onSubmit={async (input) => {
								setFieldErrors(undefined);
								setServerError(undefined);

								try {
									await updateDeal(dealRecord.id, input);
									toast.success("Deal updated");
									setIsEditing(false);
									setRefreshKey((value) => value + 1);
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
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Deal details</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm md:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-xs uppercase">
								Expected close
							</p>
							<p>{dealRecord.expectedCloseDate ?? "—"}</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs uppercase">Company</p>
							<Link
								to="/companies/$companyId"
								params={{ companyId: dealRecord.companyId }}
								className="hover:underline"
							>
								{company?.name ?? "View company"}
							</Link>
						</div>
						{dealRecord.lossReason ? (
							<div className="md:col-span-2">
								<p className="text-muted-foreground text-xs uppercase">
									Loss reason
								</p>
								<p>{dealRecord.lossReason}</p>
							</div>
						) : null}
					</CardContent>
				</Card>
			)}

			{canMoveStage && !isClosedDealStage(dealRecord.stage) ? (
				<Card>
					<CardHeader>
						<CardTitle>Move stage</CardTitle>
					</CardHeader>
					<CardContent>
						<DealStageForm
							currentStage={dealRecord.stage}
							expectedCloseDate={dealRecord.expectedCloseDate}
							submitLabel="Update stage"
							serverFieldErrors={stageFieldErrors}
							serverError={stageServerError}
							onSubmit={async (input) => {
								setStageFieldErrors(undefined);
								setStageServerError(undefined);

								try {
									await moveDealStage(dealRecord.id, input);
									toast.success("Deal stage updated");
									setRefreshKey((value) => value + 1);
								} catch (error) {
									const requestError = error as CrmRequestError;

									if (requestError.fieldErrors) {
										setStageFieldErrors(requestError.fieldErrors);
										return;
									}

									setStageServerError(requestError.message);
								}
							}}
						/>
					</CardContent>
				</Card>
			) : null}

			<EntityTimelinePanel
				activities={timelineState.data.activities}
				tasks={timelineState.data.tasks}
				permissions={crmProfile.permissions}
				relatedDealId={dealRecord.id}
				onActivityLogged={async () => {
					setRefreshKey((value) => value + 1);
				}}
			/>
		</div>
	);
}
