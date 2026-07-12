import { Button } from "@portfolio-saas-crm/ui/components/button";
import { Input } from "@portfolio-saas-crm/ui/components/input";
import { Label } from "@portfolio-saas-crm/ui/components/label";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useCrmProfileContext } from "@/components/crm-shell/crm-profile-context";
import {
	RecordPageError,
	RecordPageLoadingState,
	useAsyncResource,
} from "@/components/crm-records/record-page-states";
import {
	createAdminUser,
	fetchAdminUsers,
	hasCrmPermission,
	type CrmRequestError,
	type CrmRole,
} from "@/lib/crm-client";

export const Route = createFileRoute("/_auth/admin/users/new")({
	component: NewAdminUserPage,
});

function NewAdminUserPage() {
	const navigate = useNavigate();
	const crmProfile = useCrmProfileContext();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
	const [serverError, setServerError] = useState<string>();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<CrmRole>("sales_representative");
	const [teamId, setTeamId] = useState("");
	const teamsState = useAsyncResource(() => fetchAdminUsers(), []);

	if (!hasCrmPermission(crmProfile.permissions, "users.manage")) {
		return (
			<div className="p-4 md:p-6">
				<p className="text-muted-foreground text-sm">
					You do not have permission to create users.
				</p>
			</div>
		);
	}

	if (teamsState.status === "loading") {
		return <RecordPageLoadingState />;
	}

	if (teamsState.status === "error") {
		return <RecordPageError message={teamsState.message} />;
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
			<div className="space-y-2">
				<Link
					to="/admin/users"
					className="text-muted-foreground text-sm hover:text-foreground"
				>
					← Back to users
				</Link>
				<h1 className="font-semibold text-2xl tracking-tight">New user</h1>
			</div>

			<form
				className="space-y-4"
				data-testid="admin-user-form"
				onSubmit={async (event) => {
					event.preventDefault();
					setFieldErrors(undefined);
					setServerError(undefined);

					try {
						await createAdminUser({
							name,
							email,
							password,
							role,
							teamId: role === "administrator" ? null : teamId || null,
						});
						toast.success("User created");
						await navigate({ to: "/admin/users" });
					} catch (error) {
						const requestError = error as CrmRequestError;

						if (requestError.fieldErrors) {
							setFieldErrors(requestError.fieldErrors);
							return;
						}

						setServerError(requestError.message);
					}
				}}
			>
				{serverError ? (
					<p className="text-destructive text-sm" role="alert">
						{serverError}
					</p>
				) : null}

				<div className="space-y-2">
					<Label htmlFor="admin-user-name">Name</Label>
					<Input
						id="admin-user-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
					{fieldErrors?.name ? (
						<p className="text-destructive text-xs">
							{fieldErrors.name.join(" ")}
						</p>
					) : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="admin-user-email">Email</Label>
					<Input
						id="admin-user-email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
					{fieldErrors?.email ? (
						<p className="text-destructive text-xs">
							{fieldErrors.email.join(" ")}
						</p>
					) : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="admin-user-password">Password</Label>
					<Input
						id="admin-user-password"
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="admin-user-role">Role</Label>
					<select
						id="admin-user-role"
						className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
						value={role}
						onChange={(event) => setRole(event.target.value as CrmRole)}
					>
						<option value="administrator">Administrator</option>
						<option value="sales_manager">Sales Manager</option>
						<option value="sales_representative">Sales Representative</option>
					</select>
				</div>

				{role !== "administrator" ? (
					<div className="space-y-2">
						<Label htmlFor="admin-user-team">Team</Label>
						<select
							id="admin-user-team"
							className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
							value={teamId}
							onChange={(event) => setTeamId(event.target.value)}
						>
							<option value="">Select team</option>
							{teamsState.data.teams.map((team) => (
								<option key={team.id} value={team.id}>
									{team.name}
								</option>
							))}
						</select>
						{fieldErrors?.teamId ? (
							<p className="text-destructive text-xs">
								{fieldErrors.teamId.join(" ")}
							</p>
						) : null}
					</div>
				) : null}

				<Button type="submit">Create user</Button>
			</form>
		</div>
	);
}
