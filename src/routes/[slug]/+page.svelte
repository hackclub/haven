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
  import { event, organizeCta } from "$lib/data/content";
  import { cssUrl } from "$lib/data/images";
  import { getLang } from "$lib/lang.svelte.js";

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
  });
  const lang = getLang();
  const langSite = site.langs?.find(p => p.lang == lang) || site;
  const langImages = $derived(langSite.images);
  


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
<Fonts fonts={site.defaultLang == lang ? site.fonts : langSite.fonts} />

<SiteHeader images={site.defaultLang == lang ? images : langImages} lang={lang} poc={isPoc} />

<main id="main" class="overflow-x-clip">
  <div class="relative z-20">
    <Hero
      title={site.title}
      tagline={site.defaultLang == lang ? site.tagline : langSite.tagline}
      poc={isPoc}
      signupUrl={signupUrl}
      referral={data.referral}
      cities={data.cities}
      organizeCta={site.defaultLang == lang ? site.hero.organizeCta : langSite.hero?.organizeCta}
      mapLabel={site.defaultLang == lang ? site.hero.mapLabel : langSite.hero?.mapLabel}
      scrollLabel={site.defaultLang == lang ? site.hero.scrollLabel: langSite.hero?.scrollLabel}
      signup={site.defaultLang == lang ? site.hero.signup : langSite.hero?.signup}
      images={site.defaultLang == lang ? images : langImages}
    />
  </div>

  <div id="about" class="stage stage-middle z-10" style={middleStage}>
    <About
      title={site.defaultLang == lang ? site.about.title : langSite.about?.title}
      body={site.defaultLang == lang ? site.about.body : langSite.about?.body}
      perks={site.defaultLang == lang ? site.about.perks : langSite.about?.perks}
      images={site.defaultLang == lang ? images : langImages}
    />
    <Pitch
      poc={isPoc}
      heading={site.defaultLang == lang ? site.pitch.heading : langSite.pitch?.heading}
      items={site.defaultLang == lang ? site.pitch.items : langSite.pitch?.items}
      images={site.defaultLang == lang ? images : langImages}
    />
  </div>

  <div class="z-20">
    <Steps
      poc={isPoc}
      heading={site.defaultLang == lang ? site.steps.heading : langSite.steps?.heading}
      subheading={site.defaultLang == lang ? site.steps.subheading : langSite.steps?.subheading}
      cta={site.defaultLang == lang ? site.steps.cta : langSite.steps?.cta}
      images={site.defaultLang == lang ? images : langImages}
    />
  </div>

  <Schedule
    heading={site.defaultLang == lang ? site.schedule.heading : langSite.schedule?.heading}
    days={site.defaultLang == lang ? site.schedule.days : langSite.schedule?.days}
    tbd={site.defaultLang == lang ? site.schedule.tbd : langSite.schedule?.tbd}
    images={site.defaultLang == lang ? images : langImages}
  />

  <div class="stage stage-picnic" style={picnicStage}>
    <PastEvents
      heading={site.defaultLang == lang ? site.pastEvents.heading : langSite.pastEvents?.heading}
      items={site.defaultLang == lang ? site.pastEvents.items : langSite.pastEvents?.items}
    />
  </div>

  <Sponsors
    heading={site.defaultLang == lang ? site.sponsors.heading : langSite.sponsors?.heading}
    items={site.defaultLang == lang ? site.sponsors.items : langSite.sponsors?.items}
    images={site.defaultLang == lang ? images : langImages}
  />

  <Faq
    heading={site.defaultLang == lang ? site.faq.heading : langSite.faq?.heading}
    items={site.defaultLang == lang ? site.faq.items : langSite.faq?.items}
    cta={site.defaultLang == lang ? site.faq.cta : langSite.faq?.cta}
    images={site.defaultLang == lang ? images : langImages}
  />
</main>

<SiteFooter images={site.defaultLang == lang ? images : langImages} />
