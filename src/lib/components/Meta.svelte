<script lang="ts">
  import { defaultSiteData } from "$lib/data/site";

  interface Props {
    title?: string;
    description?: string;
    /** Social card image; a /-relative path is fine, it is resolved per-page. */
    image?: string;
  }

  let {
    title = defaultSiteData.meta.title,
    description = defaultSiteData.meta.description,
    image = defaultSiteData.meta.image,
  }: Props = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
