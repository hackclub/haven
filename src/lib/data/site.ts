import type { HavenEvent } from "$lib/server/services/events";
import {
  about,
  event,
  faqCta,
  faqHeading,
  faqs,
  heroCopy,
  meta,
  organizeCta,
  pastEvents,
  pastEventsHeading,
  perks,
  pitchHeading,
  pitches,
  scheduleHeading,
  scheduleTbd,
  signupCopy,
  sponsorsHeading,
  stepsCta,
  stepsHeading,
  stepsSubheading,
  supporters,
  supportersHeading,
} from "./content";
import { imageDefaults, type SiteImages } from "./images";
import type { SiteData, SiteDataInput } from "./types";

/**
 * Everything the page renders when nothing has been written for it — what the
 * home page shows, and the fallback each section of a city page starts from.
 */
export const defaultSiteData: SiteData = {
  meta: { title: meta.title, description: meta.description, image: meta.image },
  title: [...event.title],
  tagline: [...event.tagline],
  hero: {
    organizeCta: organizeCta.label,
    mapLabel: heroCopy.mapLabel,
    scrollLabel: heroCopy.scrollLabel,
    signup: { ...signupCopy },
  },
  about: { title: about.title, body: about.body, perks },
  pitch: { heading: pitchHeading, items: pitches },
  steps: {
    heading: stepsHeading,
    subheading: stepsSubheading,
    cta: stepsCta,
  },
  schedule: { heading: scheduleHeading, tbd: { ...scheduleTbd }, days: [] },
  pastEvents: { heading: [...pastEventsHeading], items: pastEvents },
  sponsors: { heading: supportersHeading, items: supporters },
  faq: { heading: faqHeading, cta: faqCta, items: faqs },
  images: { ...imageDefaults },
  fonts: {},
};

/** Drop keys a parse left undefined so they cannot shadow a default. */
function defined<T extends object>(value: T | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

/**
 * Merge one city's stored copy over the defaults, section by section, so a page
 * that overrides a single heading keeps the rest of the site's writing and art.
 *
 * Anything absent falls back; the event's own name is the title, and its
 * sponsors and schedule stay empty (those sections hide themselves) until the
 * organizers fill them in.
 */
export function resolveSiteData(
  data: SiteDataInput = {},
  event: HavenEvent,
): SiteData {
  const base = defaultSiteData;

  return {
    meta: {
      // No default: the page builds one from the event name instead.
      title: data.meta?.title,
      description: data.meta?.description ?? base.meta.description,
      image: data.meta?.image ?? base.meta.image,
    },
    // Fixed: the page is named after its event, whatever the document says.
    title: [event.name],
    tagline: data.tagline ?? base.tagline,
    hero: {
      organizeCta: data.hero?.organizeCta ?? base.hero.organizeCta,
      mapLabel: data.hero?.mapLabel ?? base.hero.mapLabel,
      scrollLabel: data.hero?.scrollLabel ?? base.hero.scrollLabel,
      signup: {
        placeholder:
          data.hero?.signup?.placeholder ?? base.hero.signup.placeholder,
        button: data.hero?.signup?.button ?? base.hero.signup.button,
      },
    },
    about: {
      title: data.about?.title ?? base.about.title,
      body: data.about?.body ?? base.about.body,
      perks: data.about?.perks ?? base.about.perks,
    },
    pitch: {
      heading: data.pitch?.heading ?? base.pitch.heading,
      items: data.pitch?.items ?? base.pitch.items,
    },
    steps: {
      heading: data.steps?.heading ?? base.steps.heading,
      subheading: data.steps?.subheading ?? base.steps.subheading,
      cta: data.steps?.cta ?? base.steps.cta,
    },
    schedule: {
      heading: data.schedule?.heading ?? base.schedule.heading,
      tbd: {
        title: data.schedule?.tbd?.title ?? base.schedule.tbd.title,
        body: data.schedule?.tbd?.body ?? base.schedule.tbd.body,
      },
      days: data.schedule?.days ?? [],
    },
    pastEvents: {
      heading: data.pastEvents?.heading ?? base.pastEvents.heading,
      items: data.pastEvents?.items ?? base.pastEvents.items,
    },
    sponsors: {
      // A city's sponsors are its own, so the home page's stand-ins are not a
      // default here — an empty list hides the section.
      heading: data.sponsors?.heading ?? sponsorsHeading,
      items: data.sponsors?.items ?? [],
    },
    faq: {
      heading: data.faq?.heading ?? base.faq.heading,
      cta: data.faq?.cta ?? base.faq.cta,
      items: data.faq?.items ?? base.faq.items,
    },
    images: { ...imageDefaults, ...defined(data.images) } as SiteImages,
    fonts: defined(data.fonts),
  };
}
