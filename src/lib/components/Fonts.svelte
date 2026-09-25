<script lang="ts">
  import { fontsCss, googleFontsUrl, type SiteFonts } from "$lib/data/fonts";

  let { fonts }: { fonts: SiteFonts } = $props();

  const stylesheet = $derived(googleFontsUrl(fonts));
  const css = $derived(fontsCss(fonts));
</script>

<svelte:head>
  {#if stylesheet}
    <link rel="stylesheet" href={stylesheet} />
  {/if}
  {#if css}
    <!-- Unlayered, so it wins over the theme variables Tailwind emits. -->
    {@html `<style>${css}</style>`}
  {/if}
</svelte:head>
