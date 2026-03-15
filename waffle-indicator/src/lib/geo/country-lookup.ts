import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Geometry, Position } from 'geojson';

interface CountryFeature {
  name: string;
  polygons: Position[][][]; // array of polygon rings (each ring is Position[])
}

let cachedCountries: CountryFeature[] | null = null;

async function loadCountries(): Promise<CountryFeature[]> {
  if (cachedCountries) return cachedCountries;

  const resp = await fetch('/geo/world-110m.json');
  const topology: Topology = await resp.json();
  const geojson = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>;

  const countries: CountryFeature[] = [];
  for (const feat of geojson.features) {
    const name = (feat.properties?.name as string) ?? null;
    if (!name) continue;

    const polys: Position[][][] = [];
    if (feat.geometry.type === 'Polygon') {
      polys.push(feat.geometry.coordinates);
    } else if (feat.geometry.type === 'MultiPolygon') {
      for (const poly of feat.geometry.coordinates) {
        polys.push(poly);
      }
    }
    countries.push({ name, polygons: polys });
  }

  cachedCountries = countries;
  return countries;
}

/** Ray-casting point-in-polygon test */
function pointInRing(lng: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (
      ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(lng: number, lat: number, rings: Position[][]): boolean {
  // First ring is exterior — must be inside
  if (!pointInRing(lng, lat, rings[0])) return false;
  // Remaining rings are holes — must NOT be inside any
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false;
  }
  return true;
}

/**
 * Returns the country name at the given lat/lng, or null for ocean/unresolved.
 * First call triggers async fetch of the TopoJSON file; subsequent calls use cache.
 */
export async function getCountryAtPoint(lat: number, lng: number): Promise<string | null> {
  const countries = await loadCountries();
  for (const country of countries) {
    for (const polygon of country.polygons) {
      if (pointInPolygon(lng, lat, polygon)) {
        return country.name;
      }
    }
  }
  return null;
}

/**
 * Synchronous version — returns null if data hasn't been loaded yet.
 * Call loadCountries() once to prime the cache, then use this for hot-path lookups.
 */
export function getCountryAtPointSync(lat: number, lng: number): string | null {
  if (!cachedCountries) return null;
  for (const country of cachedCountries) {
    for (const polygon of country.polygons) {
      if (pointInPolygon(lng, lat, polygon)) {
        return country.name;
      }
    }
  }
  return null;
}

/** Pre-load and cache country polygons. Call once on mount. */
export function primeCountryCache(): Promise<void> {
  return loadCountries().then(() => {});
}
