<script lang="ts">
  import Meta from "$lib/components/Meta.svelte";
  import HavenMap from "$lib/components/Map.svelte";

  // `cities` comes from the root layout load, so this route needs no load of
  // its own.
  let { data } = $props();
</script>

<Meta
  title="Haven map — game jams around the world"
  description="Every city running a Haven game jam, on one map."
/>

<a
  href="/"
  class="fixed left-4 top-4 z-10 flex h-10 items-center gap-2 rounded-full bg-white px-4 font-display text-haven-orange-deep transition-transform hover:scale-105 active:scale-100"
>
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
  <span class="inline-block translate-y-[-0.14em]">Home</span>
</a>

<!-- Fixed rather than `h-screen`, so the map tracks the visible viewport as
     mobile browser chrome slides in and out and the page never scrolls. -->
<main id="main" class="fixed inset-0">
  <HavenMap cities={data.cities} height="100%" />
</main>
