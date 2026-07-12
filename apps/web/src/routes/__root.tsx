import { Toaster } from "@portfolio-saas-crm/ui/components/sonner";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createMiddleware } from "@tanstack/react-start";
import { evlogErrorHandler } from "evlog/nitro/v3";

import Header from "../components/header";

import appCss from "../index.css?url";

export type RouterAppContext = Record<never, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
	server: {
		middleware: [createMiddleware().server(evlogErrorHandler)],
	},

	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "SaaS CRM",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap",
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const hideGlobalHeader = useRouterState({
		select: (state) => {
			const path = state.location.pathname;
			return (
				path === "/" ||
				path === "/login" ||
				state.matches.some((match) => match.routeId.startsWith("/_auth"))
			);
		},
	});

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div
					className={
						hideGlobalHeader
							? "min-h-svh"
							: "grid min-h-svh grid-rows-[auto_1fr]"
					}
				>
					{hideGlobalHeader ? null : <Header />}
					<Outlet />
				</div>
				<Toaster richColors />
				<TanStackRouterDevtools position="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
