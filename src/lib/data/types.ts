import z from "zod";

export type Marked = { text: string; mark?: boolean }[];

const linkedSchema = z
  .object({ text: z.string(), href: z.string().optional() })
  .array();
export type Linked = z.infer<typeof linkedSchema>;

const faqItemSchema = z.object({ q: z.string(), a: linkedSchema });
export type FaqItem = z.infer<typeof faqItemSchema>;

const sponsorSchema = z.object({
  name: z.string(),
  image: z.url(),
  href: z.url(),
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

export interface SiteData {
  title: string[];
  tagline: string[];
  faq: FaqItem[];
  sponsors: { heading: string; items: Sponsor[] };
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
  schedule: z
    .object({
      heading: z.string().optional(),
      days: scheduleDaySchema.array().optional(),
    })
    .optional(),
});

export type SiteDataInput = z.infer<typeof siteDataInputSchema>;
