import { eq, sql } from "drizzle-orm";
import type { SiteDataInput } from "../../data/types";
import { db } from "../db";
import { websitesTable } from "../db/schema";

/**
 * The stored copy for a city page, or null when there is no such page.
 *
 * The row's `data` is typed but is still whatever JSON was written into the
 * jsonb column — `resolveSiteData` is what fills in anything it leaves out.
 */
export async function getDataForSlug(
  slug: string,
): Promise<SiteDataInput | null> {
  const [row] = await db
    .select({ data: websitesTable.data })
    .from(websitesTable)
    .where(eq(websitesTable.slug, slug))
    .limit(1);

  return row?.data ?? null;
}

/**
 * Write the stored copy for a slug, creating the page when there is no row for
 * it yet. Airtable is the editor for this data, so a row that has never been
 * synced is the normal first case — an update-only write would mean a city
 * could not be published without a second, manual step.
 *
 * Returns whether a new page was created, so the caller can say which happened.
 */
export async function saveDataForSlug(
  slug: string,
  data: SiteDataInput,
): Promise<{ created: boolean }> {
  const [row] = await db
    .insert(websitesTable)
    .values({ slug, data })
    .onConflictDoUpdate({ target: websitesTable.slug, set: { data } })
    // `xmax` is zero only on a freshly inserted row, so this distinguishes the
    // two halves of the upsert inside the one statement — a separate existence
    // check would be both an extra round trip and a race.
    .returning({ created: sql<boolean>`xmax = 0` });

  return { created: row?.created ?? false };
}
