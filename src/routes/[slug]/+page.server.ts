import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolveSiteData } from "$lib/data/site";
import { getEventBySlug, parseSiteData } from "$lib/server/services/events";

/**
 * A city page exists exactly when an active event is synced under that slug —
 * the copy for it is a field on that event, so an event with nothing written
 * yet still renders, on the home page defaults.
 */
export const load: PageServerLoad = async ({ params }) => {
  const event = await getEventBySlug(params.slug);

  if (!event) error(404, "Not found");

  return { site: resolveSiteData(parseSiteData(event), event) };
};
