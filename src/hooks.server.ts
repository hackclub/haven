import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { checkCsrf } from "$lib/csrf";
import { startEventSync } from "$lib/server/services/events";

if (!building) startEventSync();

const UNGUARDED_PREFIXES = ["/api/slack/", "/api/fillout/", "/api/airtable/"];

export const handle: Handle = ({ event, resolve }) => {
  const { request, url } = event;

  if (UNGUARDED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return resolve(event);
  }

  return checkCsrf(request, url) ?? resolve(event);
};
