import z from "zod";
import type { SiteFonts } from "./fonts";
import { imageKeys, type ImageKey, type SiteImages } from "./images";

/**
 * Links and image sources come out of Airtable, which is an editor a lot of
 * people can reach — narrow them to the shapes a page is allowed to render so
 * a pasted `javascript:` URL can never become an anchor on a city page.
 */
const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;
const SAFE_SRC = /^(https?:\/\/|\/(?!\/))/i;

/**
 * Quotes, brackets, backslashes and whitespace never belong in a URL we are
 * about to drop into markup or into a CSS `url()`; percent-encode them instead.
 * Without this an image path like `/x'); position: fixed; inset: 0` closes the
 * `url('…')` it is interpolated into and appends CSS of the author's choosing.
 */
const URL_METACHARS = /["'()<>\\`\s]|[\u0000-\u001f\u007f]/;

const hrefSchema = z
  .string()
  .trim()
  .regex(SAFE_HREF, "must be an http(s), mailto:, /-relative or #anchor link")
  .refine((value) => !URL_METACHARS.test(value), {
    message: "must not contain quotes, brackets or spaces (percent-encode them)",
  });

const srcSchema = z
  .string()
  .trim()
  .regex(SAFE_SRC, "must be an http(s) URL or a /-relative path")
  .refine((value) => !URL_METACHARS.test(value), {
    message: "must not contain quotes, brackets or spaces (percent-encode them)",
  });

/** Which part of a photo to keep when it is cropped. A fixed set, because the
 * value is rendered as a CSS class. */
const objectPositionSchema = z
  .enum([
    "object-top",
    "object-bottom",
    "object-center",
    "object-left",
    "object-right",
  ])
  .optional();

/** A run of copy where some phrases are highlighted with the marker pen. */
const markedSchema = z
  .object({ text: z.string(), mark: z.boolean().optional() })
  .array();
export type Marked = z.infer<typeof markedSchema>;

/** A run of copy where some phrases are links. */
const linkedSchema = z
  .object({ text: z.string(), href: hrefSchema.optional() })
  .array();
export type Linked = z.infer<typeof linkedSchema>;

const linkSchema = z.object({ label: z.string(), href: hrefSchema });
export type Link = z.infer<typeof linkSchema>;

const faqItemSchema = z.object({ q: z.string(), a: linkedSchema });
export type FaqItem = z.infer<typeof faqItemSchema>;

const sponsorSchema = z.object({
  name: z.string(),
  image: srcSchema,
  href: hrefSchema,
});
export type Sponsor = z.infer<typeof sponsorSchema>;

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

/**
 * The three signs in the "what is a game jam" stage. Their positions are fixed
 * by the illustration behind them, so the first three entries land in the three
 * designed slots — a fourth perk stacks below the artwork rather than sitting
 * on it.
 */
const perkSchema = z.object({
  /** Unused; kept so documents written when it was required still validate. */
  id: z.string().optional(),
  title: z.string(),
  side: z.enum(["start", "end"]).default("start"),
  blurb: z.string().array().default([]),
  photos: z
    .object({
      src: srcSchema,
      alt: z.string().default(""),
      position: objectPositionSchema,
      href: hrefSchema.optional(),
      caption: z.object({ title: z.string(), author: z.string() }).optional(),
    })
    .array()
    .default([]),
});
export type Perk = z.infer<typeof perkSchema>;

/** Speech bubbles. Same story as the perks: three designed slots, in order. */
const pitchItemSchema = z.object({
  /** Unused; kept so documents written when it was required still validate. */
  id: z.string().optional(),
  align: z.enum(["start", "center", "end"]).default("start"),
  body: markedSchema,
});
export type PitchItem = z.infer<typeof pitchItemSchema>;

const pastEventSchema = z.object({
  title: z.string(),
  caption: z.string(),
  image: srcSchema,
  alt: z.string().default(""),
  play: srcSchema,
  href: hrefSchema,
  position: objectPositionSchema,
});
export type PastEvent = z.infer<typeof pastEventSchema>;

/** Only the keys in `imageDefaults` are overridable; anything else is dropped. */
const imagesSchema = z.object(
  Object.fromEntries(imageKeys.map((key) => [key, srcSchema.optional()])),
) as unknown as z.ZodType<Partial<Record<ImageKey, string>>>;

/**
 * A font is either a Google Fonts family name (`"Press Start 2P"`) or a font
 * file the organizer hosts (`{ "family": ..., "src": ... }`). The name ends up
 * inside a CSS string and a stylesheet URL, so it is held to the characters
 * real family names use.
 */
const fontFamilySchema = z
  .string()
  .trim()
  .max(64)
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9 -]*$/,
    "must be only letters, digits, spaces and hyphens",
  );

const fontSchema = z
  .union([
    fontFamilySchema,
    z.object({ family: fontFamilySchema, src: srcSchema.optional() }),
  ])
  .transform((value) => (typeof value === "string" ? { family: value } : value));

export interface SiteData {
  meta: { title: string | undefined; description: string; image: string };
  /** Always the event's own name; a city page cannot rename itself. */
  title: string[];
  tagline: string[];
  hero: {
    organizeCta: string;
    mapLabel: string;
    scrollLabel: string;
    signup: { placeholder: string; button: string };
  };
  about: { title: string; body: string; perks: Perk[] };
  pitch: { heading: string; items: PitchItem[] };
  steps: { heading: string; subheading: string; cta: Link };
  schedule: {
    heading: string;
    tbd: { title: string; body: string };
    days: ScheduleDay[];
  };
  pastEvents: { heading: string[]; items: PastEvent[] };
  sponsors: { heading: string; items: Sponsor[] };
  faq: { heading: string; cta: string; items: FaqItem[] };
  images: SiteImages;
  /** Only the roles a page overrides; the rest keep Haven's fonts. */
  fonts: SiteFonts;
}

/**
 * `faq` used to be the bare item array, and city pages written before the rest
 * of the copy became editable still send it that way. Accept both and normalise
 * on the way in, so old Airtable rows keep rendering.
 */
const faqSectionSchema = z
  .union([
    faqItemSchema.array(),
    z.object({
      heading: z.string().optional(),
      cta: z.string().optional(),
      items: faqItemSchema.array().optional(),
    }),
  ])
  .transform((value) => (Array.isArray(value) ? { items: value } : value));

export const siteDataInputSchema = z.object({
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: srcSchema.optional(),
    })
    .optional(),
  tagline: z.string().array().optional(),
  hero: z
    .object({
      organizeCta: z.string().optional(),
      mapLabel: z.string().optional(),
      scrollLabel: z.string().optional(),
      signup: z
        .object({
          placeholder: z.string().optional(),
          button: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  about: z
    .object({
      title: z.string().optional(),
      body: z.string().optional(),
      perks: perkSchema.array().optional(),
    })
    .optional(),
  pitch: z
    .object({
      heading: z.string().optional(),
      items: pitchItemSchema.array().optional(),
    })
    .optional(),
  steps: z
    .object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      cta: linkSchema.optional(),
    })
    .optional(),
  schedule: z
    .object({
      heading: z.string().optional(),
      tbd: z
        .object({ title: z.string().optional(), body: z.string().optional() })
        .optional(),
      days: scheduleDaySchema.array().optional(),
    })
    .optional(),
  pastEvents: z
    .object({
      heading: z.string().array().optional(),
      items: pastEventSchema.array().optional(),
    })
    .optional(),
  sponsors: z
    .object({
      heading: z.string().optional(),
      items: sponsorSchema.array().optional(),
    })
    .optional(),
  faq: faqSectionSchema.optional(),
  images: imagesSchema.optional(),
  fonts: z
    .object({ display: fontSchema.optional(), body: fontSchema.optional() })
    .optional(),
});

export type SiteDataInput = z.infer<typeof siteDataInputSchema>;

/**
 * Airtable long-text fields hold the copy as a JSON *string*, while a scripting
 * action can send a real object. Accept both, and let a string that is not JSON
 * fall through to the schema so the caller gets a field-level error either way.
 */
export const siteDataJsonSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}, siteDataInputSchema);
