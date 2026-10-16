<script lang="ts">
  import { onMount } from 'svelte';
  import type { City, HavenMapHandle } from '$lib/map';
  import { readGeoCookie, type GeoPoint } from '$lib/geo';
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
     * The event's own venue. When given, a toggle over the map switches
     * between just this pin and every event; it starts on the venue.
     */
    venue?: City;
    /** Whether the venue (rather than every event) is showing. Bindable, so
     * two maps of the same page can stay in step. */
    showVenue?: boolean;
  };

  let {
    cities,
    tilesUrl = 'https://haven.hackclub-assets.com/planet_z7.pmtiles',
    assetsUrl = 'https://protomaps.github.io/basemaps-assets',
    accent = '#FC8616',
    pinImageUrl = '/images/map-flag.png',
    height = 'min(70vh, 640px)',
    venue,
    showVenue = $bindable(true)
  }: Props = $props();

  const shown = $derived(venue && showVenue ? [venue] : cities);

  // The toggle sits over the map, and the hero opens the full-size map on any
  // tap that lands on it, so keep the toggle's own events to itself.
  const stop = (e: Event) => e.stopPropagation();

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
        tilesUrl,
        assetsUrl,
        accent,
        pinImageUrl,
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

  // Push city updates into the live source rather than rebuilding the map,
  // and reframe so flipping the venue toggle actually moves somewhere. `shown`
  // is read up front: `handle` is still null on the first run, and reading it
  // only behind `handle?.` would leave the effect subscribed to nothing.
  $effect(() => {
    const next = shown;
    if (!handle) return;
    handle.setCities(next);
    handle.fit();
  });
</script>

<div class="haven-map" style="--haven-map-height: {height}">
  <div
    bind:this={container}
    class="haven-map__canvas"
    role="application"
    aria-label="Map of Haven events worldwide"
  ></div>

  {#if venue}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -- only swallows events bubbling from the buttons inside -->
    <div
      class="haven-map__toggle"
      role="group"
      aria-label="What the map shows"
      onpointerdown={stop}
      onpointerup={stop}
      onclick={stop}
      onkeydown={stop}
    >
      <button type="button" aria-pressed={showVenue} onclick={() => (showVenue = true)}>
        Our venue
      </button>
      <button type="button" aria-pressed={!showVenue} onclick={() => (showVenue = false)}>
        All events
      </button>
    </div>
  {/if}

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

  .haven-map__toggle {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
    display: flex;
    padding: 3px;
    gap: 2px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 0 0 2px rgb(0 0 0 / 0.1);
  }

  .haven-map__toggle button {
    padding: 0.3rem 0.75rem;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #33333d;
    font: inherit;
    font-size: 0.8rem;
    line-height: 1.2;
    cursor: pointer;
  }

  .haven-map__toggle button[aria-pressed='true'] {
    background: #fc8616;
    color: #fff;
  }

  .haven-map__toggle button:focus-visible {
    outline: 2px solid #33333d;
    outline-offset: 1px;
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