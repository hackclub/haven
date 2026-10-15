<script lang="ts">
  import { page } from "$app/state";
  import Meta from "$lib/components/Meta.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import About from "$lib/components/About.svelte";
  import Pitch from "$lib/components/Pitch.svelte";
  import Steps from "$lib/components/Steps.svelte";
  import PastEvents from "$lib/components/PastEvents.svelte";
  import Faq from "$lib/components/Faq.svelte";
  import SiteFooter from "$lib/components/SiteFooter.svelte";
  // import Sponsors from "$lib/components/Sponsors.svelte";
  // import Schedule from "$lib/components/Schedule.svelte";
  // import { supporters, supportersHeading } from "$lib/data/content";
  // import { schedule, scheduleHeading } from "$lib/data/content";

  let { data } = $props();

  const isPoc = $derived(page.url.searchParams.get("poc") === "1");

  // Forwarded as-is, the way the city pages do; unlike `r` it is not kept in
  // a cookie, so it only applies to the page it arrived on.
  const signupUrl = $derived.by(() => {
    if (!data.signupUrl) return undefined;
    const url = new URL(data.signupUrl);
    const ref = page.url.searchParams.get("ref");
    if (ref) url.searchParams.set("ref", ref);
    return url.toString();
  });
</script>

<Meta />

<SiteHeader poc={isPoc} />

<main id="main" class="overflow-x-clip">
  <div class="relative z-20">
    <Hero
      poc={isPoc}
      {signupUrl}
      referral={data.referral}
      cities={data.cities}
    />
  </div>

  <div id="about" class="relative stage stage-middle z-10">
    <About />
    <Pitch poc={isPoc} />
  </div>

  <div class="relative z-20">
    <Steps poc={isPoc} />
  </div>

  <!--
  <div class="relative z-10">
    <Schedule heading={scheduleHeading} days={schedule} />
  </div>
  -->

  <div class="stage stage-picnic">
    <PastEvents />
  </div>

  <!--
  <Sponsors heading={supportersHeading} items={supporters} />
  -->

  <Faq />
</main>

<SiteFooter />
