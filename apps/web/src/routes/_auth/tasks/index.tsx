import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { TasksListPanel } from "@/components/activity/tasks-list-panel";
import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import { completeTask, fetchTasks, reopenTask } from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/tasks/")({
	component: TasksIndexPage,
});

function TasksIndexPage() {
	const crmProfile = useCrmProfileContext();
	const [refreshKey, setRefreshKey] = useState(0);
	const state = useAsyncResource(() => fetchTasks(), [refreshKey]);

	if (state.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (state.status === "error") {
		return <RecordPageError message={state.message} />;
	}

	return (
		<div className="p-4 md:p-6">
			<TasksListPanel
				tasks={state.data.items}
				scope={crmProfile.viewScopes.tasks ?? "deny"}
				permissions={crmProfile.permissions}
				onCompleteTask={async (task) => {
					try {
						await completeTask(task.id);
						toast.success("Task completed");
						setRefreshKey((value) => value + 1);
					} catch (error) {
						toast.error((error as Error).message);
					}
				}}
				onReopenTask={async (task) => {
					try {
						await reopenTask(task.id);
						toast.success("Task reopened");
						setRefreshKey((value) => value + 1);
					} catch (error) {
						toast.error((error as Error).message);
					}
				}}
			/>
		</div>
	);
}
