import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	date,
	primaryKey,
	type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const crmRoleEnum = pgEnum("crm_role", [
	"administrator",
	"sales_manager",
	"sales_representative",
]);

export const crmProfileStatusEnum = pgEnum("crm_profile_status", [
	"active",
	"disabled",
]);

export const companySizeEnum = pgEnum("company_size", [
	"startup",
	"smb",
	"mid_market",
	"enterprise",
]);

export const companyStatusEnum = pgEnum("company_status", [
	"prospect",
	"active",
	"archived",
]);

export const contactStatusEnum = pgEnum("contact_status", [
	"active",
	"archived",
]);

export const dealStageEnum = pgEnum("deal_stage", [
	"prospecting",
	"qualified",
	"proposal",
	"negotiation",
	"closed_won",
	"closed_lost",
]);

export const activityTypeEnum = pgEnum("activity_type", [
	"note",
	"call",
	"email",
	"meeting",
	"stage_change",
	"task_completed",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
]);

export const taskStatusEnum = pgEnum("task_status", ["open", "completed"]);

export const team = pgTable(
	"team",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull().unique(),
		managerProfileId: text("manager_profile_id").references(
			(): AnyPgColumn => crmProfile.id,
			{ onDelete: "set null" },
		),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("team_manager_profile_id_idx").on(table.managerProfileId)],
);

export const crmProfile = pgTable(
	"crm_profile",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		role: crmRoleEnum("role").notNull(),
		teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),
		status: crmProfileStatusEnum("status").notNull().default("active"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("crm_profile_user_id_idx").on(table.userId),
		index("crm_profile_team_id_idx").on(table.teamId),
	],
);

export const company = pgTable(
	"company",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		domain: text("domain"),
		industry: text("industry"),
		size: companySizeEnum("size"),
		status: companyStatusEnum("status").notNull().default("prospect"),
		ownerProfileId: text("owner_profile_id")
			.notNull()
			.references(() => crmProfile.id, { onDelete: "restrict" }),
		notes: text("notes"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("company_owner_profile_id_idx").on(table.ownerProfileId),
		index("company_status_idx").on(table.status),
		index("company_name_idx").on(table.name),
	],
);

export const contact = pgTable(
	"contact",
	{
		id: text("id").primaryKey(),
		companyId: text("company_id")
			.notNull()
			.references(() => company.id, { onDelete: "cascade" }),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		title: text("title"),
		email: text("email"),
		phone: text("phone"),
		status: contactStatusEnum("status").notNull().default("active"),
		ownerProfileId: text("owner_profile_id")
			.notNull()
			.references(() => crmProfile.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("contact_company_id_idx").on(table.companyId),
		index("contact_owner_profile_id_idx").on(table.ownerProfileId),
		index("contact_status_idx").on(table.status),
	],
);

export const deal = pgTable(
	"deal",
	{
		id: text("id").primaryKey(),
		companyId: text("company_id")
			.notNull()
			.references(() => company.id, { onDelete: "cascade" }),
		ownerProfileId: text("owner_profile_id")
			.notNull()
			.references(() => crmProfile.id, { onDelete: "restrict" }),
		title: text("title").notNull(),
		valueCents: integer("value_cents").notNull(),
		currency: text("currency").notNull().default("USD"),
		stage: dealStageEnum("stage").notNull().default("prospecting"),
		probability: integer("probability").notNull().default(0),
		expectedCloseDate: date("expected_close_date"),
		closedAt: timestamp("closed_at"),
		lossReason: text("loss_reason"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("deal_company_id_idx").on(table.companyId),
		index("deal_owner_profile_id_idx").on(table.ownerProfileId),
		index("deal_stage_idx").on(table.stage),
	],
);

export const dealContact = pgTable(
	"deal_contact",
	{
		dealId: text("deal_id")
			.notNull()
			.references(() => deal.id, { onDelete: "cascade" }),
		contactId: text("contact_id")
			.notNull()
			.references(() => contact.id, { onDelete: "cascade" }),
		role: text("role"),
	},
	(table) => [primaryKey({ columns: [table.dealId, table.contactId] })],
);

export const activity = pgTable(
	"activity",
	{
		id: text("id").primaryKey(),
		type: activityTypeEnum("type").notNull(),
		subject: text("subject").notNull(),
		body: text("body"),
		actorProfileId: text("actor_profile_id")
			.notNull()
			.references(() => crmProfile.id, { onDelete: "restrict" }),
		relatedCompanyId: text("related_company_id").references(() => company.id, {
			onDelete: "set null",
		}),
		relatedContactId: text("related_contact_id").references(() => contact.id, {
			onDelete: "set null",
		}),
		relatedDealId: text("related_deal_id").references(() => deal.id, {
			onDelete: "set null",
		}),
		occurredAt: timestamp("occurred_at").defaultNow().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("activity_actor_profile_id_idx").on(table.actorProfileId),
		index("activity_related_deal_id_idx").on(table.relatedDealId),
		index("activity_occurred_at_idx").on(table.occurredAt),
	],
);

export const task = pgTable(
	"task",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		assigneeProfileId: text("assignee_profile_id")
			.notNull()
			.references(() => crmProfile.id, { onDelete: "restrict" }),
		relatedCompanyId: text("related_company_id").references(() => company.id, {
			onDelete: "set null",
		}),
		relatedContactId: text("related_contact_id").references(() => contact.id, {
			onDelete: "set null",
		}),
		relatedDealId: text("related_deal_id").references(() => deal.id, {
			onDelete: "set null",
		}),
		dueDate: date("due_date"),
		priority: taskPriorityEnum("priority").notNull().default("medium"),
		status: taskStatusEnum("status").notNull().default("open"),
		completedAt: timestamp("completed_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("task_assignee_profile_id_idx").on(table.assigneeProfileId),
		index("task_status_idx").on(table.status),
		index("task_due_date_idx").on(table.dueDate),
	],
);

export const teamRelations = relations(team, ({ one, many }) => ({
	profiles: many(crmProfile),
	manager: one(crmProfile, {
		fields: [team.managerProfileId],
		references: [crmProfile.id],
		relationName: "teamManager",
	}),
}));

export const crmProfileRelations = relations(crmProfile, ({ one, many }) => ({
	user: one(user, {
		fields: [crmProfile.userId],
		references: [user.id],
	}),
	team: one(team, {
		fields: [crmProfile.teamId],
		references: [team.id],
	}),
	managedTeam: one(team, {
		fields: [crmProfile.id],
		references: [team.managerProfileId],
		relationName: "teamManager",
	}),
	companies: many(company),
	contacts: many(contact),
	deals: many(deal),
	assignedTasks: many(task),
}));

export const companyRelations = relations(company, ({ one, many }) => ({
	ownerProfile: one(crmProfile, {
		fields: [company.ownerProfileId],
		references: [crmProfile.id],
	}),
	contacts: many(contact),
	deals: many(deal),
}));

export const contactRelations = relations(contact, ({ one }) => ({
	company: one(company, {
		fields: [contact.companyId],
		references: [company.id],
	}),
	ownerProfile: one(crmProfile, {
		fields: [contact.ownerProfileId],
		references: [crmProfile.id],
	}),
}));

export const dealRelations = relations(deal, ({ one, many }) => ({
	company: one(company, {
		fields: [deal.companyId],
		references: [company.id],
	}),
	ownerProfile: one(crmProfile, {
		fields: [deal.ownerProfileId],
		references: [crmProfile.id],
	}),
	contacts: many(dealContact),
}));

export const dealContactRelations = relations(dealContact, ({ one }) => ({
	deal: one(deal, {
		fields: [dealContact.dealId],
		references: [deal.id],
	}),
	contact: one(contact, {
		fields: [dealContact.contactId],
		references: [contact.id],
	}),
}));

export const activityRelations = relations(activity, ({ one }) => ({
	actorProfile: one(crmProfile, {
		fields: [activity.actorProfileId],
		references: [crmProfile.id],
	}),
	relatedCompany: one(company, {
		fields: [activity.relatedCompanyId],
		references: [company.id],
	}),
	relatedContact: one(contact, {
		fields: [activity.relatedContactId],
		references: [contact.id],
	}),
	relatedDeal: one(deal, {
		fields: [activity.relatedDealId],
		references: [deal.id],
	}),
}));

export const taskRelations = relations(task, ({ one }) => ({
	assigneeProfile: one(crmProfile, {
		fields: [task.assigneeProfileId],
		references: [crmProfile.id],
	}),
	relatedCompany: one(company, {
		fields: [task.relatedCompanyId],
		references: [company.id],
	}),
	relatedContact: one(contact, {
		fields: [task.relatedContactId],
		references: [contact.id],
	}),
	relatedDeal: one(deal, {
		fields: [task.relatedDealId],
		references: [deal.id],
	}),
}));
