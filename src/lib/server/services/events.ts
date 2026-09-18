import { asc, eq, notInArray, sql } from "drizzle-orm";
import cron from "node-cron";
import { db } from "../db";
import { eventsTable } from "../db/schema";
import { env } from "$env/dynamic/private";
import { listRecords } from "./airtable";

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
} as const;

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
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
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

  const rows = records
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
    .map((record) => ({
      airtableId: record.id,
      slug: record.fields[FIELDS.slug] as string,
      name: record.fields[FIELDS.name] as string,
      latitude: record.fields[FIELDS.latitude] as number,
      longitude: record.fields[FIELDS.longitude] as number,
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
          syncedAt: sql`excluded."syncedAt"`,
        },
      });
  });

  return rows.length;
}

/** Every synced event, alphabetically by name. */
export async function getEvents(): Promise<HavenEvent[]> {
  return db
    .select({
      slug: eventsTable.slug,
      name: eventsTable.name,
      latitude: eventsTable.latitude,
      longitude: eventsTable.longitude,
    })
    .from(eventsTable)
    .orderBy(asc(eventsTable.name));
}

/** One event by slug, or null when nothing is synced under that slug. */
export async function getEventBySlug(slug: string): Promise<HavenEvent | null> {
  const [row] = await db
    .select({
      slug: eventsTable.slug,
      name: eventsTable.name,
      latitude: eventsTable.latitude,
      longitude: eventsTable.longitude,
    })
    .from(eventsTable)
    .where(eq(eventsTable.slug, slug))
    .limit(1);

  return row ?? null;
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

  // Once immediately, so a fresh deploy is not up to two minutes out of date.
  void runSync();
  cron.schedule(SCHEDULE, runSync);
}
