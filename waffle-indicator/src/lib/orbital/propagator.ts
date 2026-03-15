import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  SatRec,
} from 'satellite.js';
import { SATELLITES, FALLBACK_TLES, type SatelliteMeta } from './constants';

export interface SatPosition {
  satId: string;
  name: string;
  codename: string;
  type: SatelliteMeta['type'];
  color: string;
  weight: number;
  lat: number;
  lng: number;
  alt: number;
  velocity: number;
  timestamp: Date;
}

export interface SatRecord {
  meta: SatelliteMeta;
  satrec: SatRec;
}

export function initSatellites(
  tleData?: Record<number, { line1: string; line2: string }>
): SatRecord[] {
  const tles = tleData || FALLBACK_TLES;
  return SATELLITES.map((meta) => {
    const tle = tles[meta.noradId];
    if (!tle) return null;
    const satrec = twoline2satrec(tle.line1, tle.line2);
    return { meta, satrec };
  }).filter(Boolean) as SatRecord[];
}

export function getPosition(sat: SatRecord, date: Date): SatPosition | null {
  const result = propagate(sat.satrec, date);
  if (!result?.position || typeof result.position === 'boolean') return null;

  const gmst = gstime(date);
  const geo = eciToGeodetic(result.position as any, gmst);

  let latDeg = geo.latitude * (180 / Math.PI);
  let lngDeg = geo.longitude * (180 / Math.PI);

  // Normalize longitude to -180..180
  if (lngDeg > 180) lngDeg -= 360;
  if (lngDeg < -180) lngDeg += 360;

  const vel = result.velocity && typeof result.velocity !== 'boolean'
    ? Math.sqrt(
        (result.velocity as any).x ** 2 +
        (result.velocity as any).y ** 2 +
        (result.velocity as any).z ** 2
      )
    : 0;

  return {
    satId: sat.meta.id,
    name: sat.meta.name,
    codename: sat.meta.codename,
    type: sat.meta.type,
    color: sat.meta.color,
    weight: sat.meta.weight,
    lat: latDeg,
    lng: lngDeg,
    alt: geo.height,
    velocity: vel,
    timestamp: date,
  };
}

export function getGroundTrack(
  sat: SatRecord,
  startDate: Date,
  durationMinutes: number,
  stepMinutes: number = 1
): SatPosition[] {
  const positions: SatPosition[] = [];
  for (let m = 0; m <= durationMinutes; m += stepMinutes) {
    const date = new Date(startDate.getTime() + m * 60000);
    const pos = getPosition(sat, date);
    if (pos) positions.push(pos);
  }
  return positions;
}

export function getAllPositions(
  satellites: SatRecord[],
  date: Date
): SatPosition[] {
  return satellites
    .map((sat) => getPosition(sat, date))
    .filter(Boolean) as SatPosition[];
}
