<script lang="ts">
  import Meta from "$lib/components/Meta.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import SiteFooter from "$lib/components/SiteFooter.svelte";
</script>

<Meta title="Haven - Daven" />

<SiteHeader base="/" />

<main id="main" class="overflow-x-clip">
  <div class="relative z-10 flex flex-col items-center my-32">
    <img
      src="/images/daven/cool-daven.png"
      alt="daven is cool"
      class="w-full justify-self-center max-w-3xl animate-[spin_10s_linear_infinite] hover:scale-110 transition-transform"
    />
  </div>
</main>

<SiteFooter />
