<script lang="ts">
  import Meta from "$lib/components/Meta.svelte";
  import Fonts from "$lib/components/Fonts.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import About from "$lib/components/About.svelte";
  import Pitch from "$lib/components/Pitch.svelte";
  import Schedule from "$lib/components/Schedule.svelte";
  import Steps from "$lib/components/Steps.svelte";
  import PastEvents from "$lib/components/PastEvents.svelte";
  import Sponsors from "$lib/components/Sponsors.svelte";
  import Faq from "$lib/components/Faq.svelte";
  import SiteFooter from "$lib/components/SiteFooter.svelte";
  import { event } from "$lib/data/content";
  import { cssUrl } from "$lib/data/images";

  let { data } = $props();

  const site = $derived(data.site);
  const images = $derived(site.images);
  const pageTitle = $derived(
    site.meta.title ?? `${event.name} — ${site.title.join(" ")}`,
  );
  const signupUrl = $derived.by(() => {
    const url = new URL(data.signupUrl)
    url.searchParams.set('event', data.eventId)
    if (data.ref) url.searchParams.set('ref', data.ref)
    return url.toString()
  })

  // The two illustrated backdrops are CSS backgrounds, so they are swapped
  // through the custom properties `.stage-*` reads rather than an `img` src.
  const middleStage = $derived(
    `--stage-bg: ${cssUrl(images.stageMiddle)}; --stage-bg-mobile: ${cssUrl(images.stageMiddleMobile)}`,
  );
  const picnicStage = $derived(
    `--stage-bg: ${cssUrl(images.stagePicnic)}; --stage-bg-mobile: ${cssUrl(images.stagePicnicMobile)}`,
  );

  const isPoc = false;
</script>

<Meta
  title={pageTitle}
  description={site.meta.description}
  image={site.meta.image}
/>
<Fonts fonts={site.fonts} />

<SiteHeader {images} />

<main id="main" class="overflow-x-clip">
  <div class="relative z-20">
    <Hero
      title={site.title}
      tagline={site.tagline}
      poc={isPoc}
      signupUrl={signupUrl}
      referral={data.referral}
      cities={data.cities}
      organizeCta={site.hero.organizeCta}
      mapLabel={site.hero.mapLabel}
      scrollLabel={site.hero.scrollLabel}
      signup={site.hero.signup}
      {images}
    />
  </div>

  <div id="about" class="stage stage-middle z-10" style={middleStage}>
    <About
      title={site.about.title}
      body={site.about.body}
      perks={site.about.perks}
      {images}
    />
    <Pitch
      poc={isPoc}
      heading={site.pitch.heading}
      items={site.pitch.items}
      {images}
    />
  </div>

  <div class="z-20">
    <Steps
      poc={isPoc}
      heading={site.steps.heading}
      subheading={site.steps.subheading}
      cta={site.steps.cta}
      {images}
    />
  </div>

  <Schedule
    heading={site.schedule.heading}
    days={site.schedule.days}
    tbd={site.schedule.tbd}
    {images}
  />

  <div class="stage stage-picnic" style={picnicStage}>
    <PastEvents
      heading={site.pastEvents.heading}
      items={site.pastEvents.items}
    />
  </div>

  <Sponsors
    heading={site.sponsors.heading}
    items={site.sponsors.items}
    {images}
  />

  <Faq
    heading={site.faq.heading}
    items={site.faq.items}
    cta={site.faq.cta}
    {images}
  />
</main>

<SiteFooter {images} />
