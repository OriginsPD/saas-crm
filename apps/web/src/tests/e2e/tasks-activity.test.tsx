import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

import { ActivityForm } from "@/components/activity/activity-form";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { TasksListPanel } from "@/components/activity/tasks-list-panel";
import { TaskForm } from "@/components/forms/task-form";
import type { CrmPermission } from "@/lib/crm-client";

const TASK_PERMISSIONS: CrmPermission[] = [
	"tasks.view",
	"tasks.create",
	"tasks.complete",
	"activity.view",
	"activity.create",
];

const sampleTask = {
	id: "task-1",
	title: "Follow up proposal",
	description: "Send revised pricing",
	assigneeProfileId: "profile-1",
	relatedCompanyId: "company-1",
	relatedContactId: null,
	relatedDealId: "deal-1",
	dueDate: "2026-08-01",
	priority: "high" as const,
	status: "open" as const,
	completedAt: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

const completedTask = {
	...sampleTask,
	status: "completed" as const,
	completedAt: "2026-07-01T00:00:00.000Z",
};

const sampleActivity = {
	id: "activity-1",
	type: "note" as const,
	subject: "Discovery call",
	body: "Discussed timeline.",
	actorProfileId: "profile-1",
	relatedCompanyId: "company-1",
	relatedContactId: null,
	relatedDealId: "deal-1",
	occurredAt: "2026-07-02T10:00:00.000Z",
	createdAt: "2026-07-02T10:00:00.000Z",
};

describe("tasks and activity UI", () => {
	test("tasks list panel shows scope badge and create action", () => {
		render(
			<TasksListPanel
				tasks={[sampleTask]}
				scope="team_owned"
				permissions={TASK_PERMISSIONS}
			/>,
		);

		expect(screen.getByTestId("tasks-list-panel")).toBeTruthy();
		expect(screen.getByTestId("scope-badge").textContent).toBe(
			"Team-owned records",
		);
		expect(screen.getByText("New task")).toBeTruthy();
		expect(screen.getByText("Follow up proposal")).toBeTruthy();
	});

	test("tasks list panel exposes complete and reopen actions", () => {
		let completed = false;
		let reopened = false;

		const { rerender } = render(
			<TasksListPanel
				tasks={[sampleTask]}
				scope="all"
				permissions={TASK_PERMISSIONS}
				onCompleteTask={async () => {
					completed = true;
				}}
				onReopenTask={async () => {
					reopened = true;
				}}
			/>,
		);

		fireEvent.click(screen.getByTestId("complete-task-task-1"));
		expect(completed).toBe(true);

		rerender(
			<TasksListPanel
				tasks={[completedTask]}
				scope="all"
				permissions={TASK_PERMISSIONS}
				onCompleteTask={async () => {
					completed = true;
				}}
				onReopenTask={async () => {
					reopened = true;
				}}
			/>,
		);

		fireEvent.click(screen.getByTestId("reopen-task-task-1"));
		expect(reopened).toBe(true);
	});

	test("task form validates required title", async () => {
		render(
			<TaskForm
				submitLabel="Create task"
				initialValues={{
					title: "",
					description: "",
					assigneeProfileId: "profile-1",
					relatedCompanyId: "",
					relatedContactId: "",
					relatedDealId: "",
					dueDate: "",
					priority: "medium",
				}}
				onSubmit={async () => undefined}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Create task" }));

		expect(await screen.findByText("Task title is required.")).toBeTruthy();
	});

	test("activity form validates required subject", async () => {
		render(
			<ActivityForm
				submitLabel="Log activity"
				relatedCompanyId="company-1"
				onSubmit={async () => undefined}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Log activity" }));

		expect(await screen.findByText("Subject is required.")).toBeTruthy();
	});

	test("activity timeline sorts activity and open tasks reverse chronological", () => {
		render(
			<ActivityTimeline activities={[sampleActivity]} tasks={[sampleTask]} />,
		);

		expect(screen.getByTestId("timeline-activity-activity-1")).toBeTruthy();
		expect(screen.getByTestId("timeline-task-task-1")).toBeTruthy();
	});

	test("activity timeline shows empty state", () => {
		render(<ActivityTimeline activities={[]} tasks={[]} />);

		expect(screen.getByTestId("activity-timeline-empty")).toBeTruthy();
	});
});
