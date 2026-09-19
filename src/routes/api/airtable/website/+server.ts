import type { RequestHandler } from "./$types";
import z from "zod";
import { checkAirtableAuth } from "$lib/airtable";
import { saveDataForSlug } from "$lib/server/services/websites";
import { siteDataJsonSchema } from "$lib/data/types";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

const payloadSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(SLUG_RE, "must be lowercase letters, numbers and hyphens"),
  data: siteDataJsonSchema,
});

/**
 * Upsert the stored copy for one city page, called by an Airtable automation
 * whenever the row behind that page changes.
 *
 * `POST /api/airtable/website`
 *   Authorization: Bearer $AIRTABLE_SECRET_KEY
 *   { "slug": "sf", "data": { "title": ["San", "Francisco"], ... } }
 *
 * `data` is the whole stored document, not a patch: unknown keys are dropped
 * and any field left out goes back to the home page default on the next render
 * (see `resolveSiteData`). That keeps Airtable authoritative — clearing a field
 * there clears it on the site instead of leaving a stale value behind.
 */
export const POST: RequestHandler = async ({ request }) => {
  const unauthorized = checkAirtableAuth(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Body must be JSON" },
      { status: 400 },
    );
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        message: "Invalid payload",
        errors: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }

  const { slug, data } = parsed.data;
  const { created } = await saveDataForSlug(slug, data);

  return Response.json({
    success: true,
    message: created ? `Created /${slug}` : `Updated /${slug}`,
    slug,
    created,
    data,
  });
};
