import type { ActivityRecord, TaskRecord } from "@/lib/crm-client";
import {
	formatActivityTimestamp,
	getActivityTypeLabel,
	getTaskPriorityLabel,
} from "@/lib/crm-client";

type TimelineEntry =
	| {
			kind: "activity";
			id: string;
			occurredAt: string;
			activity: ActivityRecord;
	  }
	| { kind: "task"; id: string; occurredAt: string; task: TaskRecord };

function buildTimelineEntries(
	activities: ActivityRecord[],
	tasks: TaskRecord[],
): TimelineEntry[] {
	const activityEntries: TimelineEntry[] = activities.map((activity) => ({
		kind: "activity",
		id: `activity-${activity.id}`,
		occurredAt: activity.occurredAt,
		activity,
	}));

	const openTaskEntries: TimelineEntry[] = tasks
		.filter((task) => task.status === "open")
		.map((task) => ({
			kind: "task",
			id: `task-${task.id}`,
			occurredAt: task.updatedAt,
			task,
		}));

	return [...activityEntries, ...openTaskEntries].sort(
		(left, right) =>
			new Date(right.occurredAt).getTime() -
			new Date(left.occurredAt).getTime(),
	);
}

type ActivityTimelineProps = {
	activities: ActivityRecord[];
	tasks?: TaskRecord[];
};

export function ActivityTimeline({
	activities,
	tasks = [],
}: ActivityTimelineProps) {
	const entries = buildTimelineEntries(activities, tasks);

	if (entries.length === 0) {
		return (
			<p
				className="text-muted-foreground text-sm"
				data-testid="activity-timeline-empty"
			>
				No activity or open tasks yet.
			</p>
		);
	}

	return (
		<ul className="space-y-4" data-testid="activity-timeline">
			{entries.map((entry) => {
				if (entry.kind === "activity") {
					const { activity } = entry;

					return (
						<li
							key={entry.id}
							className="rounded-lg border p-4"
							data-testid={`timeline-activity-${activity.id}`}
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<span className="inline-flex rounded-full border border-border/70 px-2 py-0.5 text-xs">
										{getActivityTypeLabel(activity.type)}
									</span>
									<p className="font-medium text-sm">{activity.subject}</p>
								</div>
								<p className="text-muted-foreground text-xs">
									{formatActivityTimestamp(activity.occurredAt)}
								</p>
							</div>
							{activity.body ? (
								<p className="mt-2 text-muted-foreground text-sm">
									{activity.body}
								</p>
							) : null}
						</li>
					);
				}

				const { task } = entry;

				return (
					<li
						key={entry.id}
						className="rounded-lg border border-dashed p-4"
						data-testid={`timeline-task-${task.id}`}
					>
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="inline-flex rounded-full border border-dashed border-border/70 px-2 py-0.5 text-xs">
									Open task
								</span>
								<p className="font-medium text-sm">{task.title}</p>
							</div>
							<p className="text-muted-foreground text-xs">
								Due {task.dueDate ?? "—"} ·{" "}
								{getTaskPriorityLabel(task.priority)}
							</p>
						</div>
						{task.description ? (
							<p className="mt-2 text-muted-foreground text-sm">
								{task.description}
							</p>
						) : null}
					</li>
				);
			})}
		</ul>
	);
}
