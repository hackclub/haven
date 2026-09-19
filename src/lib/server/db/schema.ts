import {
  boolean,
  date,
  doublePrecision,
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
    resolvedBy: text(),
    resolvedAt: timestamp({ withTimezone: true }),
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
    index().on(table.resolvedBy),
    index().on(table.resolvedAt),
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

/**
 * Approved Haven satellite events, mirrored from the "Events" table of the
 * "YSWS - Haven" Airtable base by `syncEvents`. Airtable is authoritative: this
 * table is a read cache so a page render is a local query rather than a call
 * out to an API with a rate limit on it.
 *
 * Keyed by the Airtable record id, not the slug — an event can be renamed or
 * given an `Override Slug`, and keying on the slug would make that look like a
 * delete plus an insert instead of the rename it is.
 */
export const eventsTable = pgTable(
  "events",
  {
    airtableId: text().primaryKey(),
    slug: text().notNull(),
    name: text().notNull(),
    latitude: doublePrecision().notNull(),
    longitude: doublePrecision().notNull(),
    syncedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    websiteData: text(),
  },
  (table) => [uniqueIndex().on(table.slug)],
);
