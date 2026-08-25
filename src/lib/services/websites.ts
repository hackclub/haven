import { eq } from "drizzle-orm";
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
