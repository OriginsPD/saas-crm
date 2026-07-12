import { Button } from "@portfolio-saas-crm/ui/components/button";
import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import { Plus } from "lucide-react";

import { CrmDataTable } from "@/components/data-table/crm-data-table";
import { ScopeBadge } from "@/components/crm-records/record-badges";
import type { CrmViewScope, TaskRecord } from "@/lib/crm-client";
import { getTaskPriorityLabel, hasCrmPermission } from "@/lib/crm-client";

type TasksListPanelProps = {
	tasks: TaskRecord[];
	scope: CrmViewScope;
	permissions: readonly string[];
	onCompleteTask?: (task: TaskRecord) => void | Promise<void>;
	onReopenTask?: (task: TaskRecord) => void | Promise<void>;
};

export function TasksListPanel({
	tasks,
	scope,
	permissions,
	onCompleteTask,
	onReopenTask,
}: TasksListPanelProps) {
	const canCreate = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"tasks.create",
	);
	const canComplete = hasCrmPermission(
		permissions as Parameters<typeof hasCrmPermission>[0],
		"tasks.complete",
	);

	return (
		<div className="space-y-6" data-testid="tasks-list-panel">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-semibold text-2xl tracking-tight">Tasks</h1>
					<p className="max-w-2xl text-muted-foreground text-sm">
						Follow-ups and assignments in your current scope.
					</p>
					<ScopeBadge scope={scope} />
				</div>
				{canCreate ? (
					<a href="/tasks/new" className={buttonVariants()}>
						<Plus className="size-4" aria-hidden="true" />
						New task
					</a>
				) : null}
			</div>

			<CrmDataTable
				testId="tasks-table"
				rows={tasks}
				searchPlaceholder="Search tasks"
				emptyTitle="No tasks in scope"
				emptyDescription="Create a task or adjust your search to see follow-ups."
				getRowId={(task) => task.id}
				columns={[
					{
						id: "title",
						header: "Task",
						searchValue: (task) => `${task.title} ${task.description ?? ""}`,
						cell: (task) => (
							<div>
								<p className="font-medium">{task.title}</p>
								{task.description ? (
									<p className="text-muted-foreground text-xs">
										{task.description}
									</p>
								) : null}
							</div>
						),
					},
					{
						id: "priority",
						header: "Priority",
						cell: (task) => getTaskPriorityLabel(task.priority),
					},
					{
						id: "dueDate",
						header: "Due",
						searchValue: (task) => task.dueDate ?? "",
						cell: (task) => task.dueDate ?? "—",
					},
					{
						id: "status",
						header: "Status",
						cell: (task) => (
							<span className="inline-flex rounded-full border border-border/70 px-2 py-0.5 text-xs">
								{task.status === "completed" ? "Completed" : "Open"}
							</span>
						),
					},
					{
						id: "actions",
						header: "Actions",
						cell: (task) =>
							canComplete ? (
								<div className="flex gap-2">
									{task.status === "open" ? (
										<Button
											size="sm"
											variant="outline"
											data-testid={`complete-task-${task.id}`}
											onClick={() => onCompleteTask?.(task)}
										>
											Complete
										</Button>
									) : (
										<Button
											size="sm"
											variant="outline"
											data-testid={`reopen-task-${task.id}`}
											onClick={() => onReopenTask?.(task)}
										>
											Reopen
										</Button>
									)}
								</div>
							) : (
								"—"
							),
					},
				]}
			/>
		</div>
	);
}
