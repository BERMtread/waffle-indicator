import { type SatRecord, getPosition } from './propagator';
import { footprintRadius, haversine } from '../geo/coverage-check';
import { EARTH_RADIUS_KM, isCorrelationEligible } from './constants';

/**
 * Phase / best-pass methodology (v4).
 *
 * A single kickoff timestamp is the wrong yardstick for an operation that unfolds
 * over time. A decapitation raid, for example, has an ingress, an assault, and an
 * exfiltration — and the exfil (with the high-value target aboard) is often the
 * most sensitive phase of all. So each operation is broken into its critical
 * PHASES, each with its own time window and point target, and scored on the single
 * best (most directly overhead) satellite pass during that window.
 *
 * score = 10 · sin(bestElevationDeg)
 *   90° (straight overhead) → 10 ; 30° → 5.0 ; 11° (grazing) → 1.9 ; no pass → 0.
 *
 * Elevation is the natural quality weight: a near-overhead pass gives the array a
 * short slant range and a near-nadir look; a low pass on the horizon barely sees
 * the target at all.
 */

export interface PhasePass {
  bestElevationDeg: number;
  passStart: string;       // ISO time the best pass entered the footprint
  passSats: string[];      // codename(s) contributing to the best pass
  passesInWindow: number;  // distinct passes over the target during the window
  coveredMinutes: number;  // minutes with >=1 sat overhead during the window
}

export interface PhaseResult extends PhasePass {
  score: number;
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

export function elevationToScore(elevDeg: number): number {
  return Math.round(10 * Math.sin((elevDeg * Math.PI) / 180) * 10) / 10;
}

/**
 * Scan [start, end] and return the highest-elevation pass over a point target,
 * plus how many passes occurred and total minutes covered.
 */
export function scorePhase(
  satellites: SatRecord[],
  target: { lat: number; lng: number },
  start: Date,
  end: Date,
  stepSeconds = 10,
): PhaseResult {
  const { lat, lng } = target;
  // Only satellites whose array is unfurled (correlation-eligible) at the phase
  // time count. Excludes BB8 (unfurl unconfirmed) and BB9/BB10 before 2026-07-20.
  satellites = satellites.filter((sat) => isCorrelationEligible(sat.meta, start));
  const steps = Math.floor((end.getTime() - start.getTime()) / (stepSeconds * 1000));

  let bestElev = 0, bestStart: Date | null = null;
  const bestSats = new Set<string>();
  let passes = 0, inPass = false, coveredSteps = 0;
  let curPeak = 0, curStart: Date | null = null, curSats = new Set<string>();

  for (let i = 0; i <= steps; i++) {
    const t = new Date(start.getTime() + i * stepSeconds * 1000);
    let peak = 0;
    const sats: string[] = [];
    for (const sat of satellites) {
      const pos = getPosition(sat, t);
      if (!pos) continue;
      const fp = footprintRadius(pos.alt);
      const { dist, elev } = pointElevationDeg(pos.lat, pos.lng, pos.alt, lat, lng);
      if (dist <= fp) { sats.push(sat.meta.codename || sat.meta.id); if (elev > peak) peak = elev; }
    }
    if (sats.length > 0) {
      coveredSteps++;
      if (!inPass) { inPass = true; passes++; curPeak = 0; curStart = t; curSats = new Set(); }
      if (peak > curPeak) { curPeak = peak; }
      sats.forEach((s) => curSats.add(s));
      if (curPeak >= bestElev && curPeak > 0) {
        // provisional: promote when this pass's running peak beats the best
      }
    } else if (inPass) {
      // close pass; check if it was the best
      if (curPeak > bestElev) { bestElev = curPeak; bestStart = curStart; bestSats.clear(); curSats.forEach((s) => bestSats.add(s)); }
      inPass = false;
    }
  }
  if (inPass && curPeak > bestElev) { bestElev = curPeak; bestStart = curStart; bestSats.clear(); curSats.forEach((s) => bestSats.add(s)); }

  return {
    bestElevationDeg: Math.round(bestElev * 10) / 10,
    passStart: bestStart ? bestStart.toISOString() : '',
    passSats: [...bestSats].sort(),
    passesInWindow: passes,
    coveredMinutes: Math.round((coveredSteps * stepSeconds / 60) * 10) / 10,
    score: elevationToScore(bestElev),
  };
}
