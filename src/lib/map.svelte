<script lang="ts">
  import { onMount } from 'svelte';
  import type { City, HavenMapHandle } from '$lib/haven-map';
  import 'maplibre-gl/dist/maplibre-gl.css';

  type Props = {
    cities: City[];
    /** Absolute URL of the .pmtiles archive, without the pmtiles:// prefix. */
    tilesUrl: string;
    /** Glyph and sprite root. Point this at your own CDN in production. */
    assetsUrl?: string;
    /** Accent colour for the generated pin/cluster shapes; ignored if `pinImageUrl` is set. */
    accent?: string;
    /** Custom pin icon URL. Falls back to a generated teardrop tinted by `accent`. */
    pinImageUrl?: string;
    /** Any height value; the map fills it. */
    height?: string;
  };

  let {
    cities,
    tilesUrl,
    assetsUrl = 'https://protomaps.github.io/basemaps-assets',
    accent = '#FC8616',
    pinImageUrl = '/images/map-flag.png',
    height = 'min(70vh, 640px)'
  }: Props = $props();

  let container: HTMLElement;
  let handle: HavenMapHandle | null = null;
  let failed = $state(false);

  onMount(() => {
    // Svelte ignores a cleanup returned from an async onMount, so the teardown
    // lives in the synchronous return below and coordinates through `disposed`.
    let disposed = false;

    // MapLibre touches `window` on import, so it can only be pulled in once
    // we're past SSR. A static import at the top would break the server render.
    import('$lib/haven-map').then(({ createHavenMap }) => {
      if (disposed) return;
      handle = createHavenMap({
        container,
        cities,
        tilesUrl,
        assetsUrl,
        accent,
        pinImageUrl,
        onError: (error) => {
          console.error('[haven-map]', error);
          failed = true;
        }
      });
      if (disposed) {
        handle.destroy();
        handle = null;
      }
    });

    return () => {
      disposed = true;
      handle?.destroy();
      handle = null;
    };
  });

  // Push city updates into the live source rather than rebuilding the map.
  $effect(() => {
    handle?.setCities(cities);
  });
</script>

<div class="haven-map" style="--haven-map-height: {height}">
  <div
    bind:this={container}
    class="haven-map__canvas"
    role="application"
    aria-label="Map of Haven events worldwide"
  ></div>

  {#if failed}
    <p class="haven-map__fallback">The map didn't load :( Please try again later!</p>
  {/if}

  <!-- Pins live on a canvas, so they are invisible to screen readers and
       crawlers. This list is the real, navigable copy of the same data, and it
       is server-rendered whether or not the map ever boots. -->
  <ul class="haven-map__cities">
    {#each cities as city (city.id)}
      <li>
        <a href={city.href}>{city.name}</a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .haven-map {
    position: relative;
    height: var(--haven-map-height);
    border-radius: inherit;
  }

  .haven-map__canvas {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
  }

  .haven-map__canvas :global(.maplibregl-canvas-container),
  .haven-map__canvas :global(.maplibregl-canvas) {
    border-radius: inherit;
  }

  .haven-map__fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
    padding: 1rem;
    text-align: center;
    pointer-events: none;
  }

  /* Reachable by screen readers and crawlers, out of the way visually. */
  .haven-map__cities {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /* MapLibre appends popups outside the component, past Svelte's style scope. */
  :global(.haven-popup h3) {
    margin: 0 0 0.25rem;
    font-size: 1rem;
  }

  :global(.haven-popup p) {
    margin: 0 0 0.5rem;
    font-size: 0.8rem;
    opacity: 0.7;
  }
</style>