import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import { cn } from "@portfolio-saas-crm/ui/lib/utils";

import { editorialEase } from "@/lib/motion";

const navItems = [
	{ label: "Product", href: "#product" },
	{ label: "Workflows", href: "#workflows" },
	{ label: "Security", href: "#security" },
];

function BrandMark({ className }: { className?: string }) {
	return (
		<img
			src="/brand/logo-mark.svg"
			alt="SaaS CRM"
			className={cn("size-9 rounded-lg", className)}
		/>
	);
}

export function SiteHeader() {
	const reduceMotion = useReducedMotion();

	return (
		<motion.header
			className="sticky top-0 z-50 border-border/60 border-b bg-background/90 backdrop-blur-md"
			initial={reduceMotion ? false : { opacity: 0, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: editorialEase }}
		>
			<div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				<Link to="/" className="group flex items-center gap-3">
					<BrandMark />
					<div className="leading-tight">
						<p className="font-semibold tracking-tight">SaaS CRM</p>
						<p className="text-muted-foreground text-xs">Sales workspace</p>
					</div>
				</Link>

				<nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
					{navItems.map((item) => (
						<a
							key={item.href}
							href={item.href}
							className="text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							{item.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<Link
						to="/login"
						className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
					>
						Sign in
					</Link>
					<Link to="/login" className={cn(buttonVariants({ size: "sm" }))}>
						Get started
					</Link>
				</div>
			</div>
		</motion.header>
	);
}

export { BrandMark };
