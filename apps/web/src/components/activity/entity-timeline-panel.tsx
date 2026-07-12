import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";
import { useState } from "react";
import { toast } from "sonner";

import { ActivityForm } from "@/components/activity/activity-form";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import type {
	ActivityRecord,
	CrmRequestError,
	TaskRecord,
} from "@/lib/crm-client";
import { createActivity, hasCrmPermission } from "@/lib/crm-client";

type EntityTimelinePanelProps = {
	activities: ActivityRecord[];
	tasks: TaskRecord[];
	permissions: readonly string[];
	relatedCompanyId?: string;
	relatedContactId?: string;
	relatedDealId?: string;
	onActivityLogged?: () => void | Promise<void>;
};

export function EntityTimelinePanel({
	activities,
	tasks,
	permissions,
	relatedCompanyId,
	relatedContactId,
	relatedDealId,
	onActivityLogged,
}: EntityTimelinePanelProps) {
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const canLogActivity = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"activity.create",
	);

	return (
		<div className="space-y-6" data-testid="entity-timeline-panel">
			<Card>
				<CardHeader>
					<CardTitle>Activity timeline</CardTitle>
				</CardHeader>
				<CardContent>
					<ActivityTimeline activities={activities} tasks={tasks} />
				</CardContent>
			</Card>

			{canLogActivity ? (
				<Card>
					<CardHeader>
						<CardTitle>Log activity</CardTitle>
					</CardHeader>
					<CardContent>
						<ActivityForm
							submitLabel="Log activity"
							relatedCompanyId={relatedCompanyId}
							relatedContactId={relatedContactId}
							relatedDealId={relatedDealId}
							serverFieldErrors={fieldErrors}
							serverError={serverError}
							onSubmit={async (input) => {
								setFieldErrors(undefined);
								setServerError(undefined);

								try {
									await createActivity(input);
									toast.success("Activity logged");
									await onActivityLogged?.();
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
			) : null}
		</div>
	);
}
