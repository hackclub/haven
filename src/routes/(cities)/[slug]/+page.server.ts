import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolveSiteData } from "$lib/data/site";
import { getEventBySlug, parseSiteData } from "$lib/server/services/events";

/**
 * A city page exists exactly when an active event is synced under that slug —
 * the copy for it is a field on that event, so an event with nothing written
 * yet still renders, on the home page defaults.
 */
export const load: PageServerLoad = async ({ params, url }) => {
  const event = await getEventBySlug(params.slug);

  if (!event) error(404, "Not found");

  const ref = url.searchParams.get("ref") || undefined;
  const site = resolveSiteData(parseSiteData(event), event);

  if (params.slug === "boise") {
    // Keep the organizer's other sponsors and copy from Airtable intact.
    if (
      !site.sponsors.items.some((sponsor) => sponsor.name === "CodeCrafters")
    ) {
      site.sponsors.items = [
        ...site.sponsors.items,
        {
          name: "CodeCrafters",
          image: "/images/sponsors/logos/codecrafters.svg",
          href: "https://codecrafters.io",
        },
      ];
    }
    site.faq.items = [
      ...site.faq.items,
      {
        q: "What prizes can our team win?",
        a: [
          { text: "CodeCrafters", href: "https://codecrafters.io" },
          {
            text: " is providing VIP memberships for our top three teams: 2 years for first place, 1 year for second place, and 6 months for third place!",
          },
        ],
      },
    ];
  }

  return {
    site,
    eventId: event.id,
    ref,
  };
};
