<script lang="ts">
  import Meta from "$lib/components/Meta.svelte";
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

  let { data } = $props();

  const site = $derived(data.site);
  const pageTitle = $derived(`${event.name} — ${site.title.join(" ")}`);

  const isPoc = false;
</script>

<Meta title={pageTitle} />

<SiteHeader />

<main id="main" class="overflow-x-clip">
  <div class="relative z-20">
    <Hero
      title={site.title}
      tagline={site.tagline}
      poc={isPoc}
      rsvpUrl={data.rsvpUrl}
    />
  </div>

  <div id="about" class="stage stage-middle z-10">
    <About />
    <Pitch poc={isPoc} />
  </div>

  <div class="z-0">
    <Steps poc={isPoc} />
  </div>

  <Schedule heading={site.schedule.heading} days={site.schedule.days} />

  <div class="stage stage-picnic">
    <PastEvents />
  </div>

  <Sponsors heading={site.sponsors.heading} items={site.sponsors.items} />

  <Faq items={site.faq} />
</main>

<SiteFooter />
