import { EARTH_RADIUS_KM, DEFAULT_MIN_ELEVATION_DEG } from '../orbital/constants';

export interface CoverageResult {
  covers: boolean;
  minDistanceKm: number;
  footprintKm: number;
  bestElevationDeg: number;
}

export function footprintRadius(altitudeKm: number, minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG): number {
  const R = EARTH_RADIUS_KM;
  const elevRad = minElevationDeg * Math.PI / 180;
  const rho = Math.asin((R / (R + altitudeKm)) * Math.cos(elevRad));
  const lambda = Math.PI / 2 - elevRad - rho;
  return R * lambda;
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = EARTH_RADIUS_KM;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function pointToSegmentMinDist(
  pLat: number, pLng: number,
  aLat: number, aLng: number,
  bLat: number, bLng: number
): number {
  const dA = haversine(pLat, pLng, aLat, aLng);
  const dB = haversine(pLat, pLng, bLat, bLng);
  const midLat = (aLat + bLat) / 2;
  const midLng = (aLng + bLng) / 2;
  const dMid = haversine(pLat, pLng, midLat, midLng);
  return Math.min(dA, dB, dMid);
}

function pointToPolygonMinDistance(lat: number, lng: number, polygon: [number, number][]): number {
  if (isPointInPolygon(lat, lng, polygon)) return 0;
  let minDist = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const d = pointToSegmentMinDist(
      lat, lng,
      polygon[i][0], polygon[i][1],
      polygon[j][0], polygon[j][1]
    );
    if (d < minDist) minDist = d;
  }
  return minDist;
}

export interface SimpleAOI {
  id: string;
  boundary: [number, number][];
  centroid: { lat: number; lng: number };
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  maxExtent: number;
  hotspots?: { name: string; lat: number; lng: number; type: string }[];
}

export function satelliteCoversAOI(
  satLat: number,
  satLng: number,
  satAltKm: number,
  aoi: SimpleAOI,
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): CoverageResult {
  const fp = footprintRadius(satAltKm, minElevationDeg);

  // Level 1: Bounding box rejection
  const fpDeg = fp / 111;
  if (satLat < aoi.bbox.minLat - fpDeg || satLat > aoi.bbox.maxLat + fpDeg ||
      satLng < aoi.bbox.minLng - fpDeg || satLng > aoi.bbox.maxLng + fpDeg) {
    return { covers: false, minDistanceKm: Infinity, footprintKm: fp, bestElevationDeg: 0 };
  }

  // Level 2: Centroid quick check
  const centroidDist = haversine(satLat, satLng, aoi.centroid.lat, aoi.centroid.lng);
  if (centroidDist > fp + aoi.maxExtent) {
    return { covers: false, minDistanceKm: centroidDist - aoi.maxExtent, footprintKm: fp, bestElevationDeg: 0 };
  }

  // Level 3: Full polygon check
  const minDist = pointToPolygonMinDistance(satLat, satLng, aoi.boundary);
  const covers = minDist <= fp;

  // Compute best elevation angle
  const R = EARTH_RADIUS_KM;
  const gamma = minDist / R;
  const bestElev = Math.atan2(
    Math.cos(gamma) - R / (R + satAltKm),
    Math.sin(gamma)
  ) * 180 / Math.PI;

  return {
    covers,
    minDistanceKm: minDist,
    footprintKm: fp,
    bestElevationDeg: Math.max(0, bestElev),
  };
}

export function getHotspotsInFootprint(
  satLat: number,
  satLng: number,
  satAltKm: number,
  hotspots: { name: string; lat: number; lng: number; type: string }[],
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): { name: string; lat: number; lng: number; type: string; distKm: number; elevDeg: number }[] {
  const fp = footprintRadius(satAltKm, minElevationDeg);
  return hotspots
    .map(h => {
      const dist = haversine(satLat, satLng, h.lat, h.lng);
      const R = EARTH_RADIUS_KM;
      const gamma = dist / R;
      const elev = Math.atan2(
        Math.cos(gamma) - R / (R + satAltKm),
        Math.sin(gamma)
      ) * 180 / Math.PI;
      return { ...h, distKm: dist, elevDeg: Math.max(0, elev) };
    })
    .filter(h => h.distKm <= fp);
}
