import { asc, desc, eq, notInArray, sql } from "drizzle-orm";
import cron from "node-cron";
import z from "zod";
import { db, hasDatabase } from "../db";
import { eventsTable } from "../db/schema";
import { env } from "$env/dynamic/private";
import { listRecords } from "./airtable";
import { warnInvalidSiteData } from "$lib/slack";
import { siteDataJsonSchema, type SiteDataInput } from "$lib/data/types";
import type { City } from "$lib/map";

/**
 * Field ids in the "Events" table of the "YSWS - Haven" base. Ids rather than
 * names because half of these are punctuated (`!Latitude`, `_Is Test`) and a
 * rename in Airtable should not quietly empty a column here.
 */
const FIELDS = {
  slug: "fldljDpbKuJ6y0Bys",
  name: "fldedrTuI1qpSYRE5",
  latitude: "fldvdwlur1tFgV0bI",
  longitude: "fldwx4BdUQw9yHGSp",
  status: "fldP2oeMSijEs3FnR",
  websiteData: "fldML1eUwOBMwWyoy",
  participantCount: "fldmQ636z6otYRTtz",
  pocSlackIds: "fld65q0Ht28BtCNko",
} as const;

/**
 * Field ids in the "Venues" table. A venue links back to its event, and only
 * one a Haven staffer has approved is shown — the rest are proposals an
 * organizer is still working through.
 */
const VENUE_FIELDS = {
  name: "fld4nzqJYaqIQ3ep2",
  event: "fldBkfN0Z52kXzEvN",
  status: "fldru928uWydwCKu8",
  addressLine1: "fldO3zZ57q0fk9JDr",
  addressLine2: "fld5OxCfWXzowDMiL",
  city: "fldkmqXMaI09CzFD4",
  state: "fldXRE3cYL98rwUnM",
  country: "fldVuWG8AmYXq5LnX",
  postalCode: "fldzt3ssJar1ltCQe",
  isPrivate: "fld6Q7pBdyxNqOM5t",
} as const;

const APPROVED_VENUE_STATUS = "Approved";

const SLACK_USER_ID_RE = /^[UW][A-Z0-9]+$/;

/**
 * The only status that means "this event is really happening". The other three
 * — On Hold, Cancelled, Merged — are all rows that exist but should not be
 * published anywhere, so they never reach the table.
 */
const ACTIVE_STATUS = "Active";

/** Every two minutes, which is well inside the 1 RPS budget: a full sync is
 * three requests for ~250 events, so the API is idle ~99% of the time. */
const SCHEDULE = "*/2 * * * *";

export interface HavenEvent {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  /** The city page's copy, as the JSON string Airtable stores it in. */
  websiteData: string | null;
  venue: EventVenue | null;
}

export interface EventVenue {
  name: string;
  /** "City, Region, Country". */
  area: string | null;
  /** The full street address on one line. */
  address: string | null;
}

/**
 * The stored copy for an event's page. Airtable is the editor, so the field is
 * routinely empty (a city that has not been written yet) and can hold anything
 * someone typed into it — either way the page falls back to the defaults in
 * `resolveSiteData` rather than failing to render.
 */
export function parseSiteData<T extends SiteDataInput = SiteDataInput>(
  event: HavenEvent,
  schema: z.ZodType<T> = siteDataJsonSchema as z.ZodType<SiteDataInput> as z.ZodType<T>,
): T {
  if (!event.websiteData) return {} as T;

  const parsed = schema.safeParse(event.websiteData);
  if (!parsed.success) {
    console.warn(
      `Ignoring invalid website data for /${event.slug}:\n${z.prettifyError(parsed.error)}`,
    );
    return {} as T;
  }

  return parsed.data;
}

/**
 * A single-select comes back as `{ id, name, color }` from the REST API but as
 * a bare string from some other Airtable surfaces, so accept either.
 */
function selectName(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "name" in value) {
    const { name } = value as { name: unknown };
    if (typeof name === "string") return name;
  }
  return null;
}

/**
 * The POCs' Slack ids, from a lookup through the POC link. They are typed in
 * by hand on the user record, so anything that is not plausibly a user id is
 * dropped rather than allowed to grant someone else's access.
 */
function pocSlackIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter((id) => SLACK_USER_ID_RE.test(id));
}

/** Trimmed text from a free-text field, or null when there is none. */
function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

type VenueColumns = {
  venueName: string | null;
  venueArea: string | null;
  venueAddress: string | null;
};

/**
 * Each event's approved venue, keyed by event record id. Returns null when
 * `AIRTABLE_VENUES_TABLE_ID` is not set, so the sync leaves the venue columns
 * alone rather than clearing them.
 *
 * An event can have more than one approved venue (it moved, or someone
 * approved a backup), so the most recently submitted one wins.
 */
async function fetchVenues(): Promise<Map<string, VenueColumns> | null> {
  const tableId = env.AIRTABLE_VENUES_TABLE_ID;
  if (!tableId) return null;

  const records = await listRecords(tableId, Object.values(VENUE_FIELDS));

  const byEvent = new Map<string, VenueColumns>();
  const approved = records
    // A private venue — someone's office or home, say — is not published at
    // all, not even its name; the page's city is enough to go on.
    .filter(
      ({ fields }) =>
        selectName(fields[VENUE_FIELDS.status]) === APPROVED_VENUE_STATUS &&
        !fields[VENUE_FIELDS.isPrivate],
    )
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime));

  for (const { fields } of approved) {
    const name = text(fields[VENUE_FIELDS.name]);
    if (!name) continue;

    const area = [VENUE_FIELDS.city, VENUE_FIELDS.state, VENUE_FIELDS.country]
      .map((id) => text(fields[id]))
      .filter(Boolean)
      .join(", ");
    const address = [
      VENUE_FIELDS.addressLine1,
      VENUE_FIELDS.addressLine2,
      VENUE_FIELDS.city,
      VENUE_FIELDS.state,
      VENUE_FIELDS.postalCode,
      VENUE_FIELDS.country,
    ]
      .map((id) => text(fields[id]))
      .filter(Boolean)
      .join(", ");

    const venue = {
      venueName: name,
      venueArea: area || null,
      venueAddress: address || null,
    };

    const events = fields[VENUE_FIELDS.event];
    if (!Array.isArray(events)) continue;
    for (const eventId of events) {
      if (typeof eventId === "string" && !byEvent.has(eventId))
        byEvent.set(eventId, venue);
    }
  }

  return byEvent;
}

/**
 * Pull the Events table and replace our mirror of it. Reads through
 * `AIRTABLE_EVENTS_VIEW_ID` when that is set, and the whole table when it is
 * not; either way the filtering below still runs.
 *
 * Rows that are no longer in Airtable are dropped *before* the upsert, not
 * after: an event that takes over a slug another event just gave up would
 * otherwise collide on the slug index halfway through the write.
 *
 * Returns how many events are now stored.
 */
export async function syncEvents(): Promise<number> {
  // The "Events" table. Same id in the production and sandbox bases.
  const tableId = env.AIRTABLE_EVENTS_TABLE_ID;
  if (!tableId) throw new Error("AIRTABLE_EVENTS_TABLE_ID is not set");

  const records = await listRecords(tableId, Object.values(FIELDS), {
    viewId: env.AIRTABLE_EVENTS_VIEW_ID,
  });
  const venues = await fetchVenues();

  const active = records
    .filter((record) => {
      const { fields } = record;
      if (selectName(fields[FIELDS.status]) !== ACTIVE_STATUS) return false;
      // An event is geocoded by an Airtable automation some minutes after it is
      // created, so a brand new row legitimately has no coordinates yet. Skip
      // it and pick it up on a later run rather than storing a null island.
      return (
        typeof fields[FIELDS.slug] === "string" &&
        typeof fields[FIELDS.name] === "string" &&
        typeof fields[FIELDS.latitude] === "number" &&
        typeof fields[FIELDS.longitude] === "number"
      );
    })
    // Oldest first, so the dedupe below keeps the same record on every run.
    .sort((a, b) => a.createdTime.localeCompare(b.createdTime));

  // Two active records sharing a slug would trip the slug index and fail the
  // whole write, taking every other event's updates down with it. Keep the
  // first one created — almost always the original, with the other a
  // duplicate someone submitted again — and leave the rest for a human.
  const bySlug = new Map<string, (typeof active)[number]>();
  for (const record of active) {
    const slug = record.fields[FIELDS.slug] as string;
    const kept = bySlug.get(slug);
    if (kept) {
      console.warn(
        `Skipping event ${record.id}: slug /${slug} is already taken by ${kept.id}`,
      );
      continue;
    }
    bySlug.set(slug, record);
  }

  const rows = [...bySlug.values()].map((record) => ({
    airtableId: record.id,
    slug: record.fields[FIELDS.slug] as string,
    name: record.fields[FIELDS.name] as string,
    latitude: record.fields[FIELDS.latitude] as number,
    longitude: record.fields[FIELDS.longitude] as number,
    websiteData: (record.fields[FIELDS.websiteData] as string) || null,
    participantCount:
      typeof record.fields[FIELDS.participantCount] === "number"
        ? (record.fields[FIELDS.participantCount] as number)
        : 0,
    pocSlackIds: pocSlackIds(record.fields[FIELDS.pocSlackIds]),
    ...(venues && {
      venueName: null,
      venueArea: null,
      venueAddress: null,
      ...venues.get(record.id),
    }),
    syncedAt: new Date(),
  }));

  await db.transaction(async (tx) => {
    // An empty result is far more likely to be a filter or permissions problem
    // than every Haven event being cancelled at once, so leave what we have
    // rather than blanking the table on a bad read.
    if (!rows.length) return;

    await tx.delete(eventsTable).where(
      notInArray(
        eventsTable.airtableId,
        rows.map((row) => row.airtableId),
      ),
    );

    await tx
      .insert(eventsTable)
      .values(rows)
      .onConflictDoUpdate({
        target: eventsTable.airtableId,
        // Drizzle names these columns exactly as the TS fields spell them, so
        // the `excluded` references have to be quoted to survive Postgres
        // lowercasing bare identifiers.
        set: {
          slug: sql`excluded."slug"`,
          name: sql`excluded."name"`,
          latitude: sql`excluded."latitude"`,
          longitude: sql`excluded."longitude"`,
          websiteData: sql`excluded."websiteData"`,
          participantCount: sql`excluded."participantCount"`,
          pocSlackIds: sql`excluded."pocSlackIds"`,
          ...(venues && {
            venueName: sql`excluded."venueName"`,
            venueArea: sql`excluded."venueArea"`,
            venueAddress: sql`excluded."venueAddress"`,
          }),
          syncedAt: sql`excluded."syncedAt"`,
        },
      });
  });

  return rows.length;
}

function toEvent({
  venueName,
  venueArea,
  venueAddress,
  ...event
}: Omit<HavenEvent, "venue"> & VenueColumns): HavenEvent {
  return {
    ...event,
    venue: venueName
      ? { name: venueName, area: venueArea, address: venueAddress }
      : null,
  };
}

/** Every synced event, alphabetically by name. */
export async function getEvents(): Promise<HavenEvent[]> {
  if (!hasDatabase) return [];

  const rows = await db
    .select({
      id: eventsTable.airtableId,
      slug: eventsTable.slug,
      name: eventsTable.name,
      latitude: eventsTable.latitude,
      longitude: eventsTable.longitude,
      websiteData: eventsTable.websiteData,
      venueName: eventsTable.venueName,
      venueArea: eventsTable.venueArea,
      venueAddress: eventsTable.venueAddress,
    })
    .from(eventsTable)
    .orderBy(asc(eventsTable.name));

  return rows.map(toEvent);
}

export async function getHavenCities(): Promise<City[]> {
  const events = await getEvents();
  return events.map((e) => ({
    id: e.slug,
    name: e.name,
    lat: e.latitude,
    lng: e.longitude,
    href: `/${e.slug}`,
  }));
}

export interface EventSignupCount {
  slug: string;
  name: string;
  signups: number;
}

/** Every synced event's participant count, most signups first. */
export async function getSignupCounts(): Promise<EventSignupCount[]> {
  if (!hasDatabase) return [];

  return db
    .select({
      slug: eventsTable.slug,
      name: eventsTable.name,
      signups: eventsTable.participantCount,
    })
    .from(eventsTable)
    .orderBy(desc(eventsTable.participantCount), asc(eventsTable.name));
}

/** One event by slug, or null when nothing is synced under that slug. */
export async function getEventBySlug(slug: string): Promise<HavenEvent | null> {
  if (!hasDatabase) return null;

  const [row] = await db
    .select({
      id: eventsTable.airtableId,
      slug: eventsTable.slug,
      name: eventsTable.name,
      latitude: eventsTable.latitude,
      longitude: eventsTable.longitude,
      websiteData: eventsTable.websiteData,
      venueName: eventsTable.venueName,
      venueArea: eventsTable.venueArea,
      venueAddress: eventsTable.venueAddress,
    })
    .from(eventsTable)
    .where(eq(eventsTable.slug, slug))
    .limit(1);

  return row ? toEvent(row) : null;
}

/**
 * Guard against a slow sync overlapping the next tick. Airtable is the only
 * thing that makes a run slow, and two runs racing would mean two deletes
 * against the same table with different ideas of what still exists.
 */
let running = false;

async function runSync() {
  if (running) return;
  running = true;
  console.log(`Starting sync at ${new Date()}`);

  try {
    const count = await syncEvents();
    console.log(`Synced ${count} Haven events from Airtable`);

    if (env.SLACK_BOT_TOKEN) {
      await warnInvalidSiteData().catch((error: unknown) => {
        console.error("Failed to warn POCs about invalid website data:", error);
      });
    }
  } catch (error) {
    // A failed sync leaves the last good copy in place, so log and wait for the
    // next tick rather than taking the server down.
    console.error("Failed to sync Haven events:", error);
  } finally {
    running = false;
  }
}

/**
 * Start the recurring sync. Called for its side effect from src/hooks.server.ts,
 * which is the one module SvelteKit loads on the way to serving anything, so the
 * schedule is running by the time a page can ask for an event.
 */
export function startEventSync() {
  if (!env.AIRTABLE_TOKEN) {
    console.warn("AIRTABLE_TOKEN is not set — Haven event sync is disabled");
    return;
  }
  if (!hasDatabase) {
    console.warn("DATABASE_URL is not set — Haven event sync is disabled");
    return;
  }

  // Once immediately, so a fresh deploy is not up to two minutes out of date.
  void runSync();
  cron.schedule(SCHEDULE, runSync);
}
