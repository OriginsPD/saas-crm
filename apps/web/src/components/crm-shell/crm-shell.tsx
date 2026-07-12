import { Button } from "@portfolio-saas-crm/ui/components/button";
import { cn } from "@portfolio-saas-crm/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import UserMenu from "@/components/user-menu";
import type { CrmMeResponse } from "@/lib/crm-client";

import {
	CRM_ROLE_LABELS,
	getRoleScopeLabel,
	getVisibleNavItems,
	type CrmNavItem,
} from "./navigation";

type CrmShellProps = {
	profile: CrmMeResponse;
	children: React.ReactNode;
};

function NavLink({
	item,
	active,
	onNavigate,
	className,
}: {
	item: CrmNavItem;
	active: boolean;
	onNavigate?: () => void;
	className?: string;
}) {
	const Icon = item.icon;

	return (
		<Link
			to={item.href}
			onClick={onNavigate}
			className={cn(
				"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
				active
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
				className,
			)}
			aria-current={active ? "page" : undefined}
		>
			<Icon className="size-4 shrink-0" aria-hidden="true" />
			<span>{item.label}</span>
		</Link>
	);
}

export function CrmShell({ profile, children }: CrmShellProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const navItems = getVisibleNavItems(profile.permissions);
	const roleLabel = CRM_ROLE_LABELS[profile.profile.role];
	const scopeLabel = getRoleScopeLabel(profile.profile.role);

	return (
		<div className="flex min-h-0 flex-1 bg-background text-foreground">
			<aside className="hidden w-64 shrink-0 border-sidebar-border border-r bg-sidebar md:flex md:flex-col">
				<div className="border-sidebar-border border-b px-5 py-4">
					<p className="font-semibold text-sm tracking-tight">Portfolio CRM</p>
					<p className="mt-1 text-sidebar-foreground/70 text-xs">{roleLabel}</p>
					<p className="text-sidebar-foreground/60 text-xs">{scopeLabel}</p>
				</div>
				<nav
					aria-label="CRM primary navigation"
					className="flex flex-1 flex-col gap-1 p-3"
				>
					{navItems.map((item) => (
						<NavLink
							key={item.id}
							item={item}
							active={
								pathname === item.href ||
								(item.href !== "/dashboard" && pathname.startsWith(item.href))
							}
						/>
					))}
				</nav>
			</aside>

			{mobileOpen ? (
				<div className="fixed inset-0 z-40 md:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-background/80 backdrop-blur-sm"
						aria-label="Close navigation menu"
						onClick={() => setMobileOpen(false)}
					/>
					<div className="absolute inset-y-0 left-0 flex w-[min(85vw,18rem)] flex-col border-border border-r bg-sidebar shadow-xl">
						<div className="flex items-center justify-between border-sidebar-border border-b px-4 py-3">
							<div>
								<p className="font-semibold text-sm">Portfolio CRM</p>
								<p className="text-sidebar-foreground/70 text-xs">
									{roleLabel}
								</p>
							</div>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setMobileOpen(false)}
								aria-label="Close menu"
							>
								<X className="size-4" />
							</Button>
						</div>
						<nav
							aria-label="CRM mobile navigation"
							className="flex flex-1 flex-col gap-1 p-3"
						>
							{navItems.map((item) => (
								<NavLink
									key={item.id}
									item={item}
									active={pathname === item.href}
									onNavigate={() => setMobileOpen(false)}
								/>
							))}
						</nav>
					</div>
				</div>
			) : null}

			<div className="flex min-h-0 min-w-0 flex-1 flex-col">
				<header className="flex items-center justify-between gap-3 border-border border-b bg-card/40 px-4 py-3 md:px-6">
					<div className="flex min-w-0 items-center gap-3">
						<Button
							variant="outline"
							size="icon-sm"
							className="md:hidden"
							onClick={() => setMobileOpen(true)}
							aria-label="Open navigation menu"
						>
							<Menu className="size-4" />
						</Button>
						<div className="min-w-0">
							<p className="truncate font-medium text-sm">
								{profile.user.name}
							</p>
							<p className="truncate text-muted-foreground text-xs">
								{roleLabel} · {scopeLabel}
							</p>
						</div>
					</div>
					<UserMenu />
				</header>

				<main className="flex min-h-0 flex-1 flex-col overflow-auto pb-20 md:pb-0">
					{children}
				</main>

				<nav
					aria-label="CRM mobile bottom navigation"
					className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-border border-t bg-card/95 p-2 backdrop-blur md:hidden"
				>
					{navItems.slice(0, 4).map((item) => {
						const Icon = item.icon;
						const active = pathname === item.href;

						return (
							<Link
								key={item.id}
								to={item.href}
								className={cn(
									"flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px]",
									active
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground",
								)}
								aria-current={active ? "page" : undefined}
							>
								<Icon className="size-4" aria-hidden="true" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>
		</div>
	);
}

export function CrmShellNavPreview({
	permissions,
}: {
	permissions: CrmMeResponse["permissions"];
}) {
	const navItems = getVisibleNavItems(permissions);

	return (
		<ul data-testid="crm-shell-nav" className="space-y-1">
			{navItems.map((item) => (
				<li key={item.id} data-nav-id={item.id}>
					{item.label}
				</li>
			))}
		</ul>
	);
}
