import { type SatRecord, getPosition } from './propagator';
import { footprintRadius, haversine } from '../geo/coverage-check';
import { EARTH_RADIUS_KM } from './constants';

/**
 * Critical-moment methodology (v3).
 *
 * v2 asked "how much is a whole region covered over a day" — and found the answer
 * is "always, roughly the same, every day", so it carried no signal. The sharper
 * question for a specific operation is narrower: at the exact critical instant
 * (strike kickoff, a rescue extraction), was an ASTS "waffle" actually overhead
 * the specific target — or, if not, how close in time was the nearest pass?
 *
 * Because the Block-1 BlueBirds fly as a single-plane train, any given point on
 * the ground is only inside a footprint during a handful of short passes per day.
 * So coincidence with a critical moment is genuinely informative: a pass within a
 * few minutes is a near-hit; the nearest pass being an hour away is a clean miss.
 *
 * criticalScore = 10 · exp(-gap / 15), where `gap` is the minutes between the
 * critical moment and the nearest instant the target is inside any footprint.
 * gap = 0 → 10 (overhead at the moment); gap = 15 min → ~3.7; gap ≥ ~1h → ~0.
 */

export interface CriticalMomentResult {
  target: { lat: number; lng: number };
  t0: string;
  windowMin: number;
  coveredAtMoment: boolean;
  satsAtMoment: string[];
  bestElevAtMomentDeg: number;
  nearestPassGapMin: number;      // absolute minutes to nearest coverage
  nearestPassSignedMin: number | null; // negative = before t0, positive = after
  nearestPassSats: string[];
  nearestPassElevDeg: number;
  passesInWindow: number;
  maxConcurrentInWindow: number;
  criticalScore: number;
}

function pointElevationDeg(satLat: number, satLng: number, satAltKm: number, tLat: number, tLng: number) {
  const dist = haversine(satLat, satLng, tLat, tLng);
  const gamma = dist / EARTH_RADIUS_KM;
  const elev = Math.atan2(
    Math.cos(gamma) - EARTH_RADIUS_KM / (EARTH_RADIUS_KM + satAltKm),
    Math.sin(gamma),
  ) * 180 / Math.PI;
  return { dist, elev: Math.max(0, elev) };
}

/** Which satellites cover a point target at time t, and the best elevation. */
function stateAt(satellites: SatRecord[], t: Date, tLat: number, tLng: number) {
  const sats: string[] = [];
  let bestElev = 0;
  for (const sat of satellites) {
    const pos = getPosition(sat, t);
    if (!pos) continue;
    const fp = footprintRadius(pos.alt);
    const { dist, elev } = pointElevationDeg(pos.lat, pos.lng, pos.alt, tLat, tLng);
    if (dist <= fp) {
      sats.push(sat.meta.codename || sat.meta.id);
      if (elev > bestElev) bestElev = elev;
    }
  }
  return { sats, bestElev };
}

export function scoreCriticalMoment(
  satellites: SatRecord[],
  target: { lat: number; lng: number },
  t0: Date,
  windowMin = 240,
  stepSeconds = 15,
): CriticalMomentResult {
  const { lat, lng } = target;
  const at0 = stateAt(satellites, t0, lat, lng);

  const n = Math.floor((windowMin * 60) / stepSeconds);
  const covered: boolean[] = [];
  const which: string[][] = [];
  const elevs: number[] = [];
  let maxConcurrent = 0;
  for (let i = -Math.floor(n / 2); i <= Math.floor(n / 2); i++) {
    const t = new Date(t0.getTime() + i * stepSeconds * 1000);
    const st = stateAt(satellites, t, lat, lng);
    covered.push(st.sats.length > 0);
    which.push(st.sats);
    elevs.push(st.bestElev);
    if (st.sats.length > maxConcurrent) maxConcurrent = st.sats.length;
  }

  const center = Math.floor(covered.length / 2);
  let gap: number | null = null;
  let signed: number | null = null;
  let npIdx = center;
  if (covered[center]) { gap = 0; signed = 0; }
  else {
    for (let r = 1; r < covered.length; r++) {
      const lo = center - r, hi = center + r;
      if (lo >= 0 && covered[lo]) { gap = (r * stepSeconds) / 60; signed = -gap; npIdx = lo; break; }
      if (hi < covered.length && covered[hi]) { gap = (r * stepSeconds) / 60; signed = gap; npIdx = hi; break; }
    }
    if (gap === null) { gap = windowMin / 2; signed = null; }
  }

  let passes = 0, run = false;
  for (const c of covered) { if (c && !run) { passes++; run = true; } else if (!c) run = false; }

  return {
    target,
    t0: t0.toISOString(),
    windowMin,
    coveredAtMoment: covered[center],
    satsAtMoment: at0.sats,
    bestElevAtMomentDeg: Math.round(at0.bestElev * 10) / 10,
    nearestPassGapMin: Math.round(gap * 10) / 10,
    nearestPassSignedMin: signed === null ? null : Math.round(signed * 10) / 10,
    nearestPassSats: which[npIdx],
    nearestPassElevDeg: Math.round(elevs[npIdx] * 10) / 10,
    passesInWindow: passes,
    maxConcurrentInWindow: maxConcurrent,
    criticalScore: Math.round(10 * Math.exp(-gap / 15) * 10) / 10,
  };
}
