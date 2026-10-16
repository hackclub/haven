import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolveSiteData } from "$lib/data/site";
import { getEventBySlug, parseSiteData } from "$lib/server/services/events";
import type { City } from "$lib/map";

/**
 * A city page exists exactly when an active event is synced under that slug —
 * the copy for it is a field on that event, so an event with nothing written
 * yet still renders, on the home page defaults.
 */
export const load: PageServerLoad = async ({ params, url }) => {
  const event = await getEventBySlug(params.slug);

  if (!event) error(404, "Not found");

  const ref = url.searchParams.get("ref") || undefined;

  // Pinned at the event's own coordinates: once a venue is approved, Airtable
  // geocodes the event from the venue's address rather than its city.
  const venue: City | undefined =
    event.venueName && event.venueAddress
      ? {
          id: `${event.slug}-venue`,
          name: event.venueName,
          lat: event.latitude,
          lng: event.longitude,
          address: event.venueAddress,
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${event.venueName}, ${event.venueAddress}`,
          )}`,
          linkLabel: "Get directions",
        }
      : undefined;

  return {
    site: resolveSiteData(parseSiteData(event), event),
    eventId: event.id,
    venue,
    ref,
  };
};
