import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

import { buttonVariants } from "@portfolio-saas-crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@portfolio-saas-crm/ui/components/card";
import { cn } from "@portfolio-saas-crm/ui/lib/utils";

import {
	editorialEase,
	heroItemVariants,
	heroStaggerVariants,
} from "@/lib/motion";

const highlights = [
	{
		title: "Built for teams",
		description:
			"Role-aware workflows with clear ownership and audit-friendly activity.",
	},
	{
		title: "Fast daily operations",
		description:
			"List, filter, and act on records without leaving a cohesive workspace.",
	},
	{
		title: "Demo-ready quality",
		description:
			"Professional UI, accessible defaults, and portfolio-grade polish.",
	},
];

export function LandingHero() {
	const reduceMotion = useReducedMotion();

	return (
		<section id="product" className="relative overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.62_0.11_180/0.14),transparent_55%)]" />
			<motion.div
				className="container relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-32"
				variants={heroStaggerVariants}
				initial={reduceMotion ? false : "hidden"}
				animate="show"
			>
				<div className="space-y-8">
					<motion.div className="space-y-5" variants={heroItemVariants}>
						<h1
							className="max-w-5xl font-semibold tracking-tight text-balance"
							style={{
								fontSize: "clamp(2.25rem, 4.8vw, 4.25rem)",
								lineHeight: 1.08,
							}}
						>
							Clarity, speed, and trust for every deal your team touches.
						</h1>
						<p className="max-w-2xl text-lg text-muted-foreground text-pretty">
							Multi-role CRM for companies, contacts, pipeline, tasks, and sales
							activity — built for credible demo-ready workflows.
						</p>
					</motion.div>
					<motion.div
						className="flex flex-wrap gap-3"
						variants={heroItemVariants}
					>
						<Link to="/login" className={cn(buttonVariants({ size: "lg" }))}>
							Start free
						</Link>
						<a
							href="#workflows"
							className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
						>
							See workflows
						</a>
					</motion.div>
				</div>

				<motion.div variants={heroItemVariants}>
					<Card className="group border-border/70 bg-card/85 shadow-md backdrop-blur transition-transform duration-700 ease-out hover:-translate-y-1">
						<CardHeader>
							<CardTitle>Why teams choose SaaS CRM</CardTitle>
							<CardDescription>
								A polished front door and a consistent product shell from day
								one.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4">
							{highlights.map((item) => (
								<div
									key={item.title}
									className="overflow-hidden rounded-lg border bg-background/70 p-4 transition-transform duration-700 ease-out group-hover:translate-x-0.5"
								>
									<p className="font-medium">{item.title}</p>
									<p className="mt-1 text-muted-foreground text-sm">
										{item.description}
									</p>
								</div>
							))}
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</section>
	);
}

export function LandingSections() {
	const reduceMotion = useReducedMotion();

	return (
		<>
			<section id="workflows" className="border-t bg-muted/30 py-24 md:py-32">
				<div className="container mx-auto max-w-6xl px-4">
					<motion.div
						className="mb-10 max-w-2xl"
						initial={reduceMotion ? false : { opacity: 0, y: 36 }}
						whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.25 }}
						transition={{ duration: 0.7, ease: editorialEase }}
					>
						<h2 className="font-semibold text-3xl tracking-tight">
							Workflows that feel product-ready
						</h2>
						<p className="mt-3 text-muted-foreground text-pretty">
							Landing, authentication, and app navigation share one design
							system and one brand voice.
						</p>
					</motion.div>
					<div className="grid auto-rows-fr grid-flow-dense gap-4 md:grid-cols-3">
						{highlights.map((item, index) => (
							<motion.div
								key={item.title}
								initial={reduceMotion ? false : { opacity: 0, y: 36 }}
								whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{
									duration: 0.7,
									ease: editorialEase,
									delay: reduceMotion ? 0 : index * 0.1,
								}}
							>
								<Card
									className={cn(
										"transition-transform duration-700 ease-out hover:-translate-y-1",
										index === 0 && "md:col-span-2",
									)}
								>
									<CardHeader>
										<CardTitle className="text-lg">{item.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{item.description}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section id="security" className="py-24 md:py-32">
				<div className="container mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 md:flex-row md:items-center">
					<motion.div
						className="max-w-2xl"
						initial={reduceMotion ? false : { opacity: 0, y: 24 }}
						whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.75, ease: editorialEase }}
					>
						<h2 className="font-semibold text-3xl tracking-tight">
							Open the workspace and run the full demo
						</h2>
						<p className="mt-3 text-muted-foreground text-pretty">
							Sign in with seeded roles, move deals through the pipeline, and
							review team performance in a polished CRM environment.
						</p>
					</motion.div>
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 24 }}
						whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.75, ease: editorialEase, delay: 0.12 }}
					>
						<Link to="/login" className={cn(buttonVariants({ size: "lg" }))}>
							Open workspace
						</Link>
					</motion.div>
				</div>
			</section>
		</>
	);
}
