import { defineMiddleware } from "astro:middleware";
import { checkCsrf } from "./lib/csrf";

const UNGUARDED_PREFIXES = ["/api/slack/", "/api/fillout/", "/api/airtable/"];

export const onRequest = defineMiddleware((context, next) => {
  const { request, url } = context;

  if (UNGUARDED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return next();
  }

  return checkCsrf(request, url) ?? next();
});
