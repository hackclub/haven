/**
 * The shape of a page's customizable copy.
 *
 * Every `/[slug]` page is the home page with these fields swapped out for
 * whatever JSON is stored for that slug (see `getDataForSlug`). Anything a
 * city does *not* set falls back to the home page's copy in content.ts, so a
 * new city can ship with nothing but a title.
 */
import {
  event,
  faqs,
  scheduleHeading,
  sponsorsHeading,
  supporters,
  supportersHeading,
} from "./content";
import type { SiteData, SiteDataInput } from "./types";

/** What the home page renders, and the base every city page is merged onto. */
export const defaultSiteData: SiteData = {
  title: [...event.title],
  tagline: [...event.tagline],
  faq: faqs,
  sponsors: { heading: supportersHeading, items: supporters },
  schedule: { heading: scheduleHeading, days: [] },
};

export function resolveSiteData(data: SiteDataInput = {}): SiteData {
  return {
    title: data.title ?? defaultSiteData.title,
    tagline: data.tagline ?? defaultSiteData.tagline,
    faq: data.faq ?? defaultSiteData.faq,
    sponsors: {
      // A city with no sponsors yet still wants the heading it will use once
      // it has some, so the two halves fall back independently.
      heading: data.sponsors?.heading ?? sponsorsHeading,
      items: data.sponsors?.items ?? [],
    },
    schedule: {
      heading: data.schedule?.heading ?? defaultSiteData.schedule.heading,
      // No inherited fallback: another city's times are not this city's times,
      // so an unset schedule renders as "TBD" rather than borrowed hours.
      days: data.schedule?.days ?? [],
    },
  };
}
