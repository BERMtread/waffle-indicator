import { type SatRecord, getPosition } from './propagator';
import { satelliteCoversAOI, type SimpleAOI } from '../geo/coverage-check';

/**
 * Coverage-duration methodology (v2).
 *
 * The Block-1 BlueBirds (BB1–BB5) launched together on 2024-09-12 and share a
 * single ~53° orbital plane — they trail each other like a string of pearls.
 * Because of that, an *instantaneous* "N waffles stacked over the target" reading
 * is almost meaningless: the constellation is a train, so who is overhead at any
 * given second is pure phase, not intent.
 *
 * What actually characterises a target during an operation is COVERAGE OVER TIME:
 *   - dwell  : how many minutes ≥1 satellite footprint covers the AOI in the window
 *   - passes : how many separate coverage intervals (revisits) occur
 *   - gap    : the typical wait between revisits
 *   - peak   : the maximum number of satellites simultaneously overhead
 *
 * scoreCoverageWindow() integrates these into a single 0–10 "coverage score".
 */

export interface CoverageWindowResult {
  aoiId: string;
  windowMinutes: number;
  stepSeconds: number;
  dwellMinutes: number;       // minutes with ≥1 sat covering
  coveragePct: number;        // dwellMinutes / windowMinutes * 100
  passes: number;             // number of distinct coverage intervals
  passDurationsMin: number[]; // duration of each pass
  maxConcurrent: number;      // peak simultaneous sats overhead
  medianGapMin: number | null;// median revisit gap between passes
  coverageScore: number;      // 0–10 composite (dwell + revisit)
  perSat: { satId: string; codename: string; dwellMin: number; passes: number }[];
}

// Anchors chosen from the operational Block-1 + BW3 + BB6 constellation:
// ~480 min dwell / 24h and ~45 passes / 24h represent a near-saturated target.
const DWELL_ANCHOR_MIN = 480;
const PASS_ANCHOR = 45;

export function coverageScore(dwellMinutes: number, passes: number): number {
  const dwellPart = Math.min(1, dwellMinutes / DWELL_ANCHOR_MIN);
  const cadencePart = Math.min(1, passes / PASS_ANCHOR);
  return Math.round((10 * (0.6 * dwellPart + 0.4 * cadencePart)) * 10) / 10;
}

function intervals(mask: boolean[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const m of mask) {
    if (m) run++;
    else if (run > 0) { out.push(run); run = 0; }
  }
  if (run > 0) out.push(run);
  return out;
}

/**
 * Propagate the constellation across [centerTime ± windowMinutes/2] and integrate
 * how the AOI is actually covered over that window.
 */
export function scoreCoverageWindow(
  satellites: SatRecord[],
  aoi: SimpleAOI,
  centerTime: Date,
  windowMinutes = 1440,
  stepSeconds = 60,
): CoverageWindowResult {
  const half = (windowMinutes * 60_000) / 2;
  const start = centerTime.getTime() - half;
  const steps = Math.floor((windowMinutes * 60) / stepSeconds) + 1;
  const stepMin = stepSeconds / 60;

  const union: boolean[] = [];
  let maxConcurrent = 0;
  const perSatMask = new Map<string, boolean[]>();
  const codenames = new Map<string, string>();

  for (let i = 0; i < steps; i++) {
    const t = new Date(start + i * stepSeconds * 1000);
    let concurrent = 0;
    for (const sat of satellites) {
      const pos = getPosition(sat, t);
      let covers = false;
      if (pos) covers = satelliteCoversAOI(pos.lat, pos.lng, pos.alt, aoi).covers;
      if (!perSatMask.has(sat.meta.id)) {
        perSatMask.set(sat.meta.id, []);
        codenames.set(sat.meta.id, sat.meta.codename);
      }
      perSatMask.get(sat.meta.id)!.push(covers);
      if (covers) concurrent++;
    }
    union.push(concurrent > 0);
    if (concurrent > maxConcurrent) maxConcurrent = concurrent;
  }

  const passDur = intervals(union).map((n) => Math.round(n * stepMin * 10) / 10);
  const dwellMinutes = Math.round(union.filter(Boolean).length * stepMin * 10) / 10;

  // revisit gaps between passes
  const gaps: number[] = [];
  let gap = 0, started = false;
  for (const m of union) {
    if (!m) gap++;
    else { if (started && gap > 0) gaps.push(gap * stepMin); gap = 0; started = true; }
  }
  gaps.sort((a, b) => a - b);
  const medianGapMin = gaps.length ? Math.round(gaps[Math.floor(gaps.length / 2)] * 10) / 10 : null;

  const perSat = [...perSatMask.entries()].map(([satId, mask]) => ({
    satId,
    codename: codenames.get(satId) || satId,
    dwellMin: Math.round(mask.filter(Boolean).length * stepMin * 10) / 10,
    passes: intervals(mask).length,
  }));

  return {
    aoiId: aoi.id,
    windowMinutes,
    stepSeconds,
    dwellMinutes,
    coveragePct: Math.round((dwellMinutes / windowMinutes) * 1000) / 10,
    passes: passDur.length,
    passDurationsMin: passDur,
    maxConcurrent,
    medianGapMin,
    coverageScore: coverageScore(dwellMinutes, passDur.length),
    perSat,
  };
}
