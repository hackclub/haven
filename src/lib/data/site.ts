import {
  event,
  faqs,
  scheduleHeading,
  sponsorsHeading,
  supporters,
  supportersHeading,
} from "./content";
import type { SiteData, SiteDataInput } from "./types";

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
      heading: data.sponsors?.heading ?? sponsorsHeading,
      items: data.sponsors?.items ?? [],
    },
    schedule: {
      heading: data.schedule?.heading ?? defaultSiteData.schedule.heading,
      days: data.schedule?.days ?? [],
    },
  };
}
