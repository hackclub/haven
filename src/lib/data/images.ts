/**
 * Every image the site renders, in one place, so a city page can swap any of
 * them from its stored JSON without a component learning about overrides.
 *
 * The keys are the contract with Airtable: `{ "images": { "hedgehog": "..." } }`
 * replaces exactly that picture and leaves the rest of the art alone. Renaming
 * a key breaks whatever JSON already uses it, so treat these as public names
 * even though the paths behind them are free to move.
 */
export const imageDefaults = {
  // Shared
  logo: "/images/logo.webp",
  navBanner: "/images/nav-banner.png",
  mapPin: "/images/map-flag.png",

  // Hero
  heroBackground: "/images/hero/hero-bg-no-sticky-tree.webp",
  heroArrow: "/images/hero/hero-arrow.webp",
  heroArrowMobile: "/images/hero/hero-arrow-white.webp",
  heroForeground: "/images/hero-foreground.webp",
  hedgehog: "/images/hedgehog.webp",
  scrollArrow: "/images/triangle-down.svg",
  signupArrow: "/images/signup-arrow.webp",
  videoChevron: "/images/faq-chevron.webp",
  videoPlay: "/images/play-triangle-1.svg",

  // The illustrated backdrops the middle of the page sits on (CSS backgrounds).
  stageMiddle: "/images/bg-middle.webp",
  stageMiddleMobile: "/images/middle/mid-phone-bg.webp",
  stagePicnic: "/images/middle/picnic-bg.webp",
  stagePicnicMobile: "/images/middle/picnic-bg-mobile.webp",

  // About
  aboutDaven: "/images/daven.webp",
  aboutSignSide: "/images/about/sign-side.webp",
  aboutSignBack: "/images/about/sign-back.webp",

  // Pitch
  pitchTriangles: "/images/banner-triangles.webp",
  pitchDaven: "/images/pitch/excited-daven.webp",
  pitchBubbleMobile: "/images/pitch/bubble-2.webp",
  pitchPanelMobile: "/images/pitch/rounded-rectangle.webp",
  pitchBubble1: "/images/pitch/bubble-1.webp",
  pitchBubble2: "/images/pitch/bubble-2.webp",
  pitchBubble3: "/images/pitch/bubble-3.webp",

  // Steps
  stepsFlowerBorder: "/images/flower-border.webp",
  stepsFlowersTopLeft: "/images/steps/flowers-top-l.webp",
  stepsFlowersTopRight: "/images/steps/flowers-top-r.webp",
  stepsFlowersBottomLeft: "/images/steps/flowers-bottom-l.webp",
  stepsFlowersBottomRight: "/images/steps/flowers-bottom-r.webp",
  stepsBackground: "/images/steps/step-bg-desktop.webp",
  stepsBackgroundPoc: "/images/steps/step-poc-bg-desktop.webp",
  stepsBackgroundMobile: "/images/steps/step-bg-mobile.webp",

  // Schedule
  scheduleTrail: "/images/schedule/trail-w.webp",
  scheduleTrailSide: "/images/schedule/trail-v.webp",
  schedulePlantsSmall: "/images/schedule/side-plants-1.webp",
  schedulePlantsLarge: "/images/schedule/side-plants-2.webp",
  scheduleSheep: "/images/schedule/sheep.webp",
  scheduleDaven: "/images/schedule/daven-smol.webp",
  schedulePlantLeft: "/images/schedule/plant-l.webp",
  schedulePlantRight: "/images/schedule/plant-r.webp",

  // Sponsors
  sponsorsEdgeTop: "/images/sponsors/map-edge-daven.webp",
  sponsorsEdgeBottom: "/images/sponsors/map-edge.webp",
  sponsorsBushSmall: "/images/sponsors/bushes-1.webp",
  sponsorsBushMedium: "/images/sponsors/bushes-2.webp",
  sponsorsBushLarge: "/images/sponsors/bushes-3.webp",
  sponsorsGrassSmall: "/images/sponsors/grass-1.webp",
  sponsorsGrassLarge: "/images/sponsors/grass-2.webp",
  sponsorsPumpkins: "/images/sponsors/pumpkin-patch.webp",
  sponsorsHouseLeft: "/images/sponsors/houses-1-l.webp",
  sponsorsHouseRight: "/images/sponsors/houses-1-r.webp",
  sponsorsHouseTop: "/images/sponsors/top-house.webp",
  sponsorsBoxXl: "/images/sponsors/brown-box-xl.webp",
  sponsorsBoxTall: "/images/sponsors/brown-box-tall.webp",
  sponsorsBoxShort: "/images/sponsors/brown-box-short.webp",
  sponsorsTrail: "/images/sponsors/lil-brown-trail.webp",

  // FAQ
  faqSky: "/images/faq/sky.webp",
  faqGround: "/images/faq/ground.webp",
  faqBushLeft: "/images/faq/bushes-1.webp",
  faqBushRight: "/images/faq/bushes-2.webp",
  faqBushBack: "/images/faq/bushes-3.webp",
  faqBushFrontRight: "/images/faq/bushes-4.webp",
  faqBushFrontLeft: "/images/faq/bushes-5.webp",
  faqPondLeft: "/images/faq/pond-1.webp",
  faqPondRight: "/images/faq/pond-2.webp",
  faqPondFront: "/images/faq/pond-3.webp",
  faqLeaves: "/images/faq/full-fall.webp",
  faqCard: "/images/faq/big-fall.webp",
  faqChevron: "/images/faq/faq-chevron.webp",
  faqArrow: "/images/footer/arrow.webp",

  // Footer
  footerBushes: "/images/footer/bottom-bushes.webp",
} as const;

export type ImageKey = keyof typeof imageDefaults;

/** The resolved set: every key present, defaults filled in. */
export type SiteImages = Record<ImageKey, string>;

export const imageKeys = Object.keys(imageDefaults) as ImageKey[];

/**
 * A CSS `url()` value that cannot escape its own quotes, for the few pictures
 * that are backgrounds rather than `img` elements.
 *
 * The schema already refuses these characters in a source, so this is the
 * second lock rather than the first: interpolating a URL straight into a style
 * attribute is the kind of thing that quietly becomes an injection the day the
 * validation moves or a new caller forgets it.
 */
export function cssUrl(src: string): string {
  return `url("${src.replace(/["'()<>\\`\s]/g, encodeURIComponent)}")`;
}
