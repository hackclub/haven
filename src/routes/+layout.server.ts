import type { LayoutServerLoad } from "./$types";
import { env } from "$env/dynamic/private";

/**
 * `$env/dynamic/private` cannot reach the browser bundle — the hero needs the
 * RSVP URL, and this is how it gets there. It is optional: the hero only shows
 * the "just want to attend" link when it is set, so a missing value hides that
 * link rather than failing the page render.
 */
export const load: LayoutServerLoad = () => {
  return { rsvpUrl: env.RSVP_URL };
};
