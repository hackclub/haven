<script lang="ts">
  interface Props {
    title?: string;
    description?: string;
  }

  let {
    title = "Haven — Organize a game jam in your city!",
    description = "Hack Club Haven is a global event for hundreds of teenagers to organize their own game jams",
  }: Props = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content="/images/haven-logo-color.webp" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="/images/haven-logo-color.webp" />
</svelte:head>
