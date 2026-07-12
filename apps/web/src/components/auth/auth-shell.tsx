import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";

import { BrandMark } from "@/components/marketing/site-header";

export function AuthShell({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,oklch(0.62_0.11_180/0.12),transparent_55%)]">
			<div className="container mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
				<section className="hidden space-y-5 lg:block">
					<Link to="/" className="inline-flex items-center gap-3">
						<BrandMark className="size-10" />
						<div>
							<p className="font-semibold tracking-tight">SaaS CRM</p>
							<p className="text-muted-foreground text-sm">
								Secure workspace access
							</p>
						</div>
					</Link>
					<h1 className="max-w-lg text-4xl font-semibold tracking-tight text-balance">
						Run pipeline, contacts, and deals in one professional workspace.
					</h1>
					<p className="max-w-md text-muted-foreground text-pretty">
						Role-based access, activity timelines, and reporting — built for
						demo-ready portfolio quality.
					</p>
				</section>

				<Card className="mx-auto w-full max-w-md border-border/70 shadow-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</CardHeader>
					<CardContent>{children}</CardContent>
				</Card>
			</div>
		</div>
	);
}
