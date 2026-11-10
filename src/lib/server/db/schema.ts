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
    /** When the helpers were pinged about the ticket being open for a day. */
    escalatedAt: timestamp({ withTimezone: true }),
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
    participantCount: integer().notNull().default(0),
    /** Slack ids of the event's POCs, which may edit its signup notifications. */
    pocSlackIds: text().array().notNull().default([]),
    /**
     * SHA-256 of the `websiteData` the POCs were last told is invalid, so each
     * broken version is reported once rather than on every sync.
     */
    websiteDataWarnedHash: text(),
    venueName: text(),
    venueAddress: text(),
    /** A private venue hides the venue line, so name and address stay null. */
    venueIsPrivate: boolean().notNull().default(false),
    /**
     * The local part of the city's `@haven.hackclub.com` Google account, which
     * the page's contact link emails. Null until an account is set up.
     */
    googleUsername: text(),
  },
  (table) => [
    uniqueIndex().on(table.slug),
    index().using("gin", table.pocSlackIds),
  ],
);

/**
 * Where to announce new signups for each event, as chosen by its POC with the
 * signup notifications slash command. Keyed by Airtable record id but not a
 * foreign key: an event that drops out of the sync (put on hold, say) should
 * get its settings back when it returns.
 *
 * Signups carry PII, so every channel here was checked to be private and to
 * have the bot in it when it was saved, and is checked again before each post.
 */
export const signupNotificationsTable = pgTable("signup_notifications", {
  eventId: text().primaryKey(),
  /** Channel ids, plus user ids for people who get the signups as a DM. */
  conversationIds: text().array().notNull().default([]),
  updatedBy: text().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * Every event's participant count as of each daily signup leaderboard, keyed
 * by Airtable record id. The next leaderboard diffs against the newest row to
 * show how many people signed up for each event since.
 */
export const signupSnapshotsTable = pgTable(
  "signup_snapshots",
  {
    id: uuid().primaryKey().defaultRandom(),
    counts: jsonb().$type<Record<string, number>>().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.createdAt)],
);

/**
 * Every click on an announcement button, which carry Block Kit Builder's
 * default `actionId-0` and `actionId-1` action ids. Nothing reads this; it is a
 * log to query by hand. The useful fields are pulled out into columns, and `payload` keeps the
 * rest of Slack's interaction payload, minus the verification token, trigger id
 * and response URL.
 */
export const announcementClicksTable = pgTable(
  "announcement_clicks",
  {
    id: uuid().primaryKey().defaultRandom(),
    actionId: text().notNull(),
    blockId: text().notNull(),
    value: text(),
    buttonText: text(),
    /** When Slack says the click happened, as a Slack timestamp. */
    actionTs: text().notNull(),
    userId: text().notNull(),
    username: text(),
    teamId: text(),
    /** "message", "view" or "message_attachment". */
    containerType: text().notNull(),
    channelId: text(),
    channelName: text(),
    messageTs: text(),
    /** The text of the message the button was on, if it was a message. */
    messageText: text(),
    isEphemeral: boolean(),
    viewId: text(),
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index().on(table.actionId),
    index().on(table.userId),
    index().on(table.messageTs),
    index().on(table.createdAt),
  ],
);
