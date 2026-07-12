import { cors } from "@elysiajs/cors";
import { auth } from "@portfolio-saas-crm/auth";
import { env } from "@portfolio-saas-crm/env/server";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import {
	type BetterAuthInstance,
	createAuthMiddleware,
} from "evlog/better-auth";
import { evlog } from "evlog/elysia";

import { crmAuthPlugin } from "./modules/authz/middleware";
import { buildCrmMeResponse } from "./modules/authz/profile";
import { companiesRoutes } from "./modules/companies/routes";
import { contactsRoutes } from "./modules/contacts/routes";
import { dealsRoutes } from "./modules/deals/routes";
import { activitiesRoutes } from "./modules/activities/routes";
import { adminUsersRoutes } from "./modules/admin/routes";
import { tasksRoutes } from "./modules/tasks/routes";
import { reportsRoutes } from "./modules/reports/routes";

initLogger({
	env: { service: "portfolio-saas-crm-server" },
});

const identifyUser = createAuthMiddleware(auth as BetterAuthInstance, {
	exclude: ["/api/auth/**"],
	maskEmail: true,
});

export function createApp() {
	return new Elysia()
		.use(evlog())
		.derive(async ({ request, log }) => {
			await identifyUser(log, request.headers, new URL(request.url).pathname);
			return {};
		})
		.use(
			cors({
				origin: env.CORS_ORIGIN,
				methods: ["GET", "POST", "PATCH", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization"],
				credentials: true,
			}),
		)
		.all("/api/auth/*", async (context) => {
			const { request, status } = context;
			if (["POST", "GET"].includes(request.method)) {
				return auth.handler(request);
			}
			return status(405);
		})
		.group("/api/crm", (app) =>
			app
				.use(crmAuthPlugin)
				.get("/me", ({ crmSession, crmProfile }) =>
					buildCrmMeResponse(crmSession.user, crmProfile),
				)
				.use(companiesRoutes)
				.use(contactsRoutes)
				.use(dealsRoutes)
				.use(tasksRoutes)
				.use(activitiesRoutes)
				.use(reportsRoutes),
		)
		.group("/api/admin", (app) => app.use(crmAuthPlugin).use(adminUsersRoutes))
		.get("/", () => "OK");
}

if (import.meta.main) {
	createApp().listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
}
