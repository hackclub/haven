<script lang="ts">
  import { onMount } from 'svelte';
  import type { City, HavenMapHandle } from '$lib/map';
  import { readGeoCookie, type GeoPoint } from '$lib/geo';
  import { env } from '$env/dynamic/public';
  import 'maplibre-gl/dist/maplibre-gl.css';

  type Props = {
    cities: City[];
    /** Absolute URL of the .pmtiles archive, without the pmtiles:// prefix. */
    tilesUrl?: string;
    /** Glyph and sprite root. Point this at your own CDN in production. */
    assetsUrl?: string;
    /** Accent colour for the generated pin/cluster shapes; ignored if `pinImageUrl` is set. */
    accent?: string;
    /** Custom pin icon URL. Falls back to a generated teardrop tinted by `accent`. */
    pinImageUrl?: string;
    /** Any height value; the map fills it. */
    height?: string;
    /**
     * The event's own venue. When given, this is a venue map instead: just
     * that pin, bigger, at street level, ignoring `cities`.
     */
    venue?: City;
  };

  let {
    cities,
    tilesUrl = 'https://haven.hackclub-assets.com/planet_z7.pmtiles',
    assetsUrl = 'https://protomaps.github.io/basemaps-assets',
    accent = '#FC8616',
    pinImageUrl = '/images/map-flag.png',
    height = 'min(70vh, 640px)',
    venue
  }: Props = $props();

  const shown = $derived(venue ? [venue] : cities);

  // The world map's archive stops at z6, which is a whole region on a venue
  // map. A street-level archive goes here once one is hosted; until then the
  // venue map uses the world tiles and stops zooming at z7.
  const tiles = $derived((venue && env.PUBLIC_VENUE_TILES_URL) || tilesUrl);

  let container: HTMLElement;
  let handle: HavenMapHandle | null = null;
  let failed = $state(false);

  onMount(() => {
    // Svelte ignores a cleanup returned from an async onMount, so the teardown
    // lives in the synchronous return below and coordinates through `disposed`.
    let disposed = false;

    // A cached location centers the map on first paint. Without one the map
    // opens on every city and flies over once `/api/geo` answers (and caches).
    // A venue page opens on its venue, so the visitor's location is irrelevant.
    const cached = venue ? null : readGeoCookie();
    const located: Promise<GeoPoint | null> =
      cached !== undefined
        ? Promise.resolve(cached)
        : fetch('/api/geo')
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null);

    // MapLibre touches `window` on import, so it can only be pulled in once
    // we're past SSR. A static import at the top would break the server render.
    import('$lib/map').then(({ createHavenMap }) => {
      if (disposed) return;
      handle = createHavenMap({
        container,
        cities: shown,
        tilesUrl: tiles,
        assetsUrl,
        accent,
        pinImageUrl,
        pinScale: venue ? 1.5 : 1,
        focus: cached ?? undefined,
        onError: (error) => {
          console.error('[haven-map]', error);
          failed = true;
        }
      });
      if (disposed) {
        handle.destroy();
        handle = null;
        return;
      }
      if (cached === undefined) {
        located.then((point) => {
          if (point && !disposed) handle?.focusOn(point);
        });
      }
    });

    return () => {
      disposed = true;
      handle?.destroy();
      handle = null;
    };
  });

  // Push city updates into the live source rather than rebuilding the map.
  // `shown` is read up front: `handle` is still null on the first run, and
  // reading it only behind `handle?.` would leave the effect subscribed to
  // nothing.
  $effect(() => {
    const next = shown;
    handle?.setCities(next);
  });
</script>

<div class="haven-map" style="--haven-map-height: {height}">
  <div
    bind:this={container}
    class="haven-map__canvas"
    role="application"
    aria-label={venue ? `Map showing ${venue.name}` : 'Map of Haven events worldwide'}
  ></div>

  {#if failed}
    <p class="haven-map__fallback">The map didn't load :( Please try again later!</p>
  {/if}

  <!-- Pins live on a canvas, so they are invisible to screen readers and
       crawlers. This list is the real, navigable copy of the same data, and it
       is server-rendered whether or not the map ever boots. -->
  <ul class="haven-map__cities">
    {#each shown as city (city.id)}
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

  :global(.maplibregl-popup-close-button) {
  right: 0.5rem;
}
</style>