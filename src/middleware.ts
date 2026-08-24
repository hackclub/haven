import { defineMiddleware } from "astro:middleware";
import { checkCsrf } from "./lib/csrf";

/**
 * Paths that authenticate the caller instead of the browsing context, and so
 * cannot be held to a same-origin check:
 *
 * - `/api/slack/` — Slack signs every request with the signing secret; verify
 *   it with `verifySlackRequest` from src/lib/slack.ts. Slack sends no
 *   `Origin` header, which is why Astro's own check had to go.
 * - `/api/fillout/` — Fillout calls these server-to-server and proves itself
 *   with the per-user token from the form URL. No cookie or session is
 *   involved, so there is nothing for a cross-site form to ride on.
 *
 * Anything added here MUST verify its caller itself. Everything else gets the
 * same-origin guard by default.
 */
const UNGUARDED_PREFIXES = ["/api/slack/", "/api/fillout/"];

export const onRequest = defineMiddleware((context, next) => {
  const { request, url } = context;

  if (UNGUARDED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return next();
  }

  return checkCsrf(request, url) ?? next();
});
