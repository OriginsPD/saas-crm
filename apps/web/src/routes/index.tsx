import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/marketing/site-header";
import {
	LandingHero,
	LandingSections,
} from "@/components/marketing/landing-hero";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<SiteHeader />
			<main className="overflow-x-hidden">
				<LandingHero />
				<LandingSections />
			</main>
			<footer className="border-t py-8">
				<div className="container mx-auto max-w-6xl px-4 text-muted-foreground text-sm">
					<p>SaaS CRM · Professional portfolio application</p>
				</div>
			</footer>
		</div>
	);
}
