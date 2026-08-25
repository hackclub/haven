import z from "zod";

/** A run of copy where some spans get the yellow highlighter treatment. */
export type Marked = { text: string; mark?: boolean }[];

/** A run of copy where some spans are links. */
const linkedSchema = z
  .object({ text: z.string(), href: z.string().optional() })
  .array();
export type Linked = z.infer<typeof linkedSchema>;

const faqItemSchema = z.object({ q: z.string(), a: linkedSchema });
export type FaqItem = z.infer<typeof faqItemSchema>;

/**
 * One logo wall, two labels: the home page credits the people backing Haven
 * globally ("supporters"), a city page credits whoever is feeding *that* room
 * ("sponsors"). Same shape, same design — see Sponsors.astro.
 */
const sponsorSchema = z.object({
  name: z.string(),
  image: z.url(),
  href: z.url(),
});
export type Sponsor = z.infer<typeof sponsorSchema>;

/**
 * Only city pages run a schedule — the home page has no single set of times to
 * publish. Days are explicit rather than a flat list of rows because a jam
 * spans a weekend, and "10:00 AM" means nothing without the day next to it.
 */
const scheduleDaySchema = z.object({
  day: z.string(),
  items: z
    .object({
      time: z.string(),
      title: z.string(),
      body: z.string().optional(),
    })
    .array(),
});
export type ScheduleDay = z.infer<typeof scheduleDaySchema>;

export interface SiteData {
  /** Hero headline — one entry per line. */
  title: string[];
  /** Line under the headline; parts are joined by a ♥ from `sm` up. */
  tagline: string[];
  faq: FaqItem[];
  /** Logo wall. Titled "supporters" on the home page, "sponsors" on a city. */
  sponsors: { heading: string; items: Sponsor[] };
  /**
   * City pages only — the home page passes no schedule to render. An empty
   * `days` is a normal state, not a missing one: the section says "TBD".
   */
  schedule: { heading: string; days: ScheduleDay[] };
}

export const siteDataInputSchema = z.object({
  title: z.string().array().optional(),
  tagline: z.string().array().optional(),
  faq: faqItemSchema.array().optional(),
  sponsors: z
    .object({
      heading: z.string().optional(),
      items: sponsorSchema.array().optional(),
    })
    .optional(),
});

/**
 * Stored slug data is untrusted JSON, so it is a deep partial: fill the gaps
 * from the defaults rather than trusting a row to carry every field.
 */
export type SiteDataInput = {
  title?: string[];
  tagline?: string[];
  faq?: FaqItem[];
  sponsors?: { heading?: string; items?: Sponsor[] };
  schedule?: { heading?: string; days?: ScheduleDay[] };
};
