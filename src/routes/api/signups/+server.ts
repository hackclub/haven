import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getSignupCounts } from "$lib/server/services/events";

/**
 * Public signup counts for every active event, from the synced copy of
 * Airtable. Counts only, so anyone may read it from anywhere; it is never
 * fresher than the last sync, so a short shared cache costs nothing.
 */
const HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=60",
};

export const OPTIONS: RequestHandler = () => new Response(null, { status: 204, headers: HEADERS });

/** `{ total, events: [{ slug, name, signups }] }`, most signups first. */
export const GET: RequestHandler = async () => {
  const events = await getSignupCounts();
  const total = events.reduce((sum, e) => sum + e.signups, 0);
  return json({ total, events }, { headers: HEADERS });
};
