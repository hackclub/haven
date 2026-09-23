import * as maplibregl from "maplibre-gl";
import type { Map as MaplibreMap, GeoJSONSource } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import type { FeatureCollection, Point } from "geojson";

export type City = {
  /** Stable identifier, used as the pin feature id. */
  id: string;
  /** Display name, e.g. "Lisbon". */
  name: string;
  lat: number;
  lng: number;
  /** Where the pin links to, e.g. "/c/lisbon". */
  href: string;
  /** Organizer name, shown in the popup when present. */
  organizer?: string;
};

export type HavenMapOptions = {
  container: HTMLElement;
  cities: City[];
  /** Absolute URL of the .pmtiles archive, without the pmtiles:// prefix. */
  tilesUrl: string;
  /** Glyph and sprite root. Point this at your own CDN in production. */
  assetsUrl?: string;
  /** Accent colour for the generated pin/cluster shapes; ignored if `pinImageUrl` is set. */
  accent?: string;
  /** Custom pin icon URL. Falls back to a generated teardrop tinted by `accent`. */
  pinImageUrl?: string;
  onError?: (error: unknown) => void;
};

export type HavenMapHandle = {
  map: MaplibreMap;
  /** Swap the pins without rebuilding the map — for filter UI. */
  setCities: (cities: City[]) => void;
  destroy: () => void;
};

const ASSETS_DEFAULT = "https://protomaps.github.io/basemaps-assets";
const PIN_IMAGE_ID = "haven-pin";

/**
 * addProtocol registers globally, so it must happen once per page rather than
 * once per map. Client-side navigations back to this route land here again.
 */
let protocolRegistered = false;
function registerPmtilesProtocol() {
  if (protocolRegistered) return;
  maplibregl.addProtocol("pmtiles", new Protocol().tile);
  protocolRegistered = true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toFeatureCollection(cities: City[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: cities.map((city) => ({
      type: "Feature",
      id: city.id,
      geometry: { type: "Point", coordinates: [city.lng, city.lat] },
      properties: {
        id: city.id,
        name: city.name,
        organizer: city.organizer ?? "",
        href: city.href,
      },
    })),
  };
}

/**
 * The map's pin icon. A custom `pinImageUrl` is used as-is; otherwise a
 * teardrop is generated and rasterised at 2x so it stays crisp on retina
 * displays.
 */
function pinImage(accent: string, pinImageUrl?: string): Promise<HTMLImageElement> {
  const src = pinImageUrl
    ? pinImageUrl
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="72" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.8 12.44 20.86 12.97 21.33a1.55 1.55 0 0 0 2.06 0C15.56 34.86 28 23.8 28 14 28 6.27 21.73 0 14 0Z" fill="${accent}"/>
    <circle cx="14" cy="14" r="5.25" fill="#fff"/>
  </svg>`,
      )}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function popupHtml(props: Record<string, string>) {
  const meta = props.organizer ? escapeHtml(props.organizer) : "";
  return `
    <div class="haven-popup">
      <h3>${escapeHtml(props.name)}</h3>
      ${meta ? `<p>${meta}</p>` : ""}
      <a href="${escapeHtml(props.href)}">See this event</a>
    </div>`;
}

export function createHavenMap({
  container,
  cities: initialCities,
  tilesUrl,
  assetsUrl = ASSETS_DEFAULT,
  accent = "#ec3750",
  pinImageUrl,
  onError,
}: HavenMapOptions): HavenMapHandle {
  let cities = initialCities;

  registerPmtilesProtocol();

  const map = new maplibregl.Map({
    container,
    style: {
      version: 8,
      glyphs: `${assetsUrl}/fonts/{fontstack}/{range}.pbf`,
      sprite: `${assetsUrl}/sprites/v4/light`,
      sources: {
        protomaps: {
          type: "vector",
          url: `pmtiles://${tilesUrl}`,
          attribution:
            '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
      },
      layers: layers("protomaps", namedFlavor("light"), { lang: "en" }),
    },
    center: [10, 25],
    zoom: 1.4,
    // The archive stops at z6; past z7 MapLibre upscales and the basemap blurs.
    maxZoom: 7,
    minZoom: 1,
    // Stops the world repeating sideways, which would strand pins on copies of
    // the earth that the fitBounds call never visits.
    renderWorldCopies: false,
    attributionControl: { compact: true },
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.on("error", (e) => onError?.(e.error));

  map.on("load", async () => {
    try {
      map.addImage(PIN_IMAGE_ID, await pinImage(accent, pinImageUrl), { pixelRatio: 2 });
    } catch {
      // Fall through: the symbol layer degrades to its text label.
    }

    map.addSource("cities", {
      type: "geojson",
      data: toFeatureCollection(cities),
      cluster: false,
      clusterRadius: 24,
      clusterMaxZoom: 6,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "cities",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": accent,
        "circle-opacity": 0.92,
        "circle-radius": ["step", ["get", "point_count"], 17, 10, 22, 30, 28],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "cities",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Noto Sans Medium"],
        "text-size": 13,
      },
      paint: { "text-color": "#fff" },
    });

    map.addLayer({
      id: "pins",
      type: "symbol",
      source: "cities",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": PIN_IMAGE_ID,
        "icon-size": 0.8,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 11,
        "text-offset": [0, 0.4],
        "text-anchor": "top",
        "text-optional": true,
      },
      paint: {
        "text-color": "#33333d",
        "text-halo-color": "#fff",
        "text-halo-width": 1.5,
      },
    });

    fitToCities();
  });

  function fitToCities() {
    const bounds = new maplibregl.LngLatBounds();
    for (const city of cities) bounds.extend([city.lng, city.lat]);
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 56, maxZoom: 4, animate: false });
    }
  }

  const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    offset: 30,
    maxWidth: "260px",
  });

  map.on("click", "pins", (e) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const [lng, lat] = (feature.geometry as Point).coordinates;
    popup
      .setLngLat([lng, lat])
      .setHTML(popupHtml(feature.properties as Record<string, string>))
      .addTo(map);
  });

  map.on("click", "clusters", async (e) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const source = map.getSource("cities") as GeoJSONSource;
    const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id);
    const center = (feature.geometry as Point).coordinates as [number, number];
    if (prefersReducedMotion()) map.jumpTo({ center, zoom });
    else map.easeTo({ center, zoom, duration: 420 });
  });

  for (const layer of ["pins", "clusters"]) {
    map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
  }

  return {
    map,
    setCities(next: City[]) {
      cities = next;
      const source = map.getSource("cities") as GeoJSONSource | undefined;
      source?.setData(toFeatureCollection(next));
    },
    destroy() {
      popup.remove();
      map.remove();
    },
  };
}