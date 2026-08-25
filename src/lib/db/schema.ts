import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { SiteDataInput } from "../../data/types";
import type { HCAAddress } from "../services/hca";
import { encryptedText } from "./columns";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  token: uuid().unique().notNull().defaultRandom(),
  hcaToken: encryptedText().notNull(),
  hcaId: text().unique().notNull(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  legalFirstName: text(),
  legalLastName: text(),
  primaryEmail: text().notNull(),
  birthday: date(),
  phoneNumber: text(),
  yswsEligible: boolean().notNull().default(false),
  verificationStatus: text().notNull(),
  overrideIneligible: boolean().notNull().default(false),
  slackId: text(),
  address: jsonb().$type<HCAAddress | null>().default(null),
});

export const websitesTable = pgTable("websites", {
  slug: text().primaryKey(),
  data: jsonb().$type<SiteDataInput>().notNull(),
});

export const ticketsTable = pgTable(
  "tickets",
  {
    id: uuid().primaryKey().defaultRandom(),
    helpMessageTs: text().notNull(),
    helpReplyMessageTs: text().notNull(),
    // ticketsMessageTs: text().notNull(),
    resolved: boolean().notNull().default(false),
    openedBy: text().notNull(),
    text: text().notNull(),
    latestMessageAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex().on(table.helpMessageTs),
    uniqueIndex().on(table.helpReplyMessageTs),
    // uniqueIndex().on(table.ticketsMessageTs),
    index().on(table.openedBy),
    index().on(table.latestMessageAt),
    index().on(table.createdAt),
  ],
);

export const ticketSummariesTable = pgTable(
  "ticket_summaries",
  {
    ts: text().primaryKey(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.createdAt)],
);
