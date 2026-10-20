import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolveSiteData } from "$lib/data/site";
import { getEventBySlug, parseSiteData } from "$lib/server/services/events";

/**
 * Yerevan is an ordinary city page — its copy lives in the event's website
 * JSON like every other city — but it has its own route so the page can carry
 * the Armenian typography tweaks in `+page.svelte` without touching the shared
 * theme. The dedicated route takes precedence over `[slug]` for `/yerevan`.
 */
export const load: PageServerLoad = async ({ url }) => {
  const event = await getEventBySlug("yerevan");

  if (!event) error(404, "Not found");

  const ref = url.searchParams.get("ref") || undefined;

  return {
    site: resolveSiteData(parseSiteData(event), event),
    eventId: event.id,
    ref,
  };
};
