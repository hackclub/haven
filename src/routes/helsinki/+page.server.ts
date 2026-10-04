import z from "zod";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { resolveSiteData } from "$lib/data/site";
import { getEventBySlug, parseSiteData, type HavenEvent } from "$lib/server/services/events";
import { siteDataInputSchema, siteDataJsonSchema, type SiteData } from "$lib/data/types";

/**
 * Helsinki's page, like a city page under `[slug]`, but its copy can also carry
 * translations that the visitor switches between.
 */
export const load: PageServerLoad = async ({ url }) => {
  const event = await getEventBySlug("helsinki");

  if (!event) error(404, "Not found");

  const ref = url.searchParams.get("ref") || undefined;
  const site = resolveHelSiteData(parseSiteData(event, helSiteDataJsonSchema), event);

  return {
    site,
    eventId: event.id,
    ref,
  };
};

// type for each language
const langSiteDataInputSchema = siteDataInputSchema.omit({ meta: true }).extend({
  /** Two-letter language code */
  lang: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "must be a two-letter language code")
    .transform((value) => value.toLowerCase()),
  prettyLang: z.string().optional(),
});

// base site input type
const helSiteDataInputSchema = siteDataInputSchema.extend({
  /** Two-letter language code */
  defaultLang: z
        .string()
        .trim()
        .regex(/^[A-Za-z]{2}$/, "must be a two-letter language code")
        .transform((value) => value.toLowerCase())
        .optional(),
  defaultPrettyLang: z.string().optional(),
  langs: z.array(langSiteDataInputSchema).optional(),
})

type LangsInputType = z.infer<typeof langSiteDataInputSchema>[];
type SiteDataInput = z.infer<typeof helSiteDataInputSchema>;

interface LangsType extends SiteData {
  lang: string,
  prettyLang: string
}

interface HelSiteData extends SiteData {
  defaultLang: string,
  defaultPrettyLang: string,
  langs?: LangsType[]
}

// the same JSON-string handling as the shared schema, then the Helsinki fields
const helSiteDataJsonSchema = z.pipe(siteDataJsonSchema.in, helSiteDataInputSchema);

/**
 * Lay a translation over the page's own copy, so anything it leaves out stays
 * as the page has it rather than falling back to the home page defaults.
 * Arrays are replaced whole.
 */
function overlay<T>(base: T, over: unknown): T {
  if (over === undefined) return base;
  if (!isObject(base) || !isObject(over)) return over as T;

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(over)) {
    merged[key] = overlay(merged[key], value);
  }
  return merged as T;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveLangs(
  data: SiteDataInput,
  langs: LangsInputType,
  event: HavenEvent,
): LangsType[] {
  const langs2: any = [];

  if (langs) {
    langs.forEach((lang) => {
      const base = resolveSiteData(overlay(data, lang), event);
      langs2.push({
        ...base,
        lang: lang.lang,
        prettyLang: lang.prettyLang || lang.lang
      })
    })
  }

  return langs2;
}

function resolveHelSiteData(
  data: SiteDataInput = {},
  event: HavenEvent,
): HelSiteData {
  const base = resolveSiteData(data, event);
  const langs = data.langs ? resolveLangs(data, data.langs, event) : undefined;

  return {
    ...base,
    defaultLang: data.defaultLang || "fi",
    defaultPrettyLang: data.defaultPrettyLang || "Suomi",
    langs
  }
}