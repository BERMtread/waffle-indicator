export interface SatelliteMeta {
  id: string;
  name: string;
  codename: string;
  noradId: number;
  type: 'prototype' | 'block1' | 'block2';
  weight: number;
  color: string;
  arraySize: string;
  launched: string;
  // Correlation eligibility: the array must be unfurled to count as a "waffle".
  // correlationFrom = ISO date from which this sat is usable for correlation
  //   (null = unfurl not officially confirmed -> excluded entirely).
  correlationFrom: string | null;
  unfurlNote?: string;
}

export const SATELLITES: SatelliteMeta[] = [
  { id: 'bw3', name: 'BlueWalker 3', codename: 'OG WAFFLE', noradId: 53807, type: 'prototype', weight: 3.5, color: '#FFB800', arraySize: '64 m²', launched: '2022-09-11', correlationFrom: '2022-10-01' },
  { id: 'bb1', name: 'BlueBird 1', codename: 'BLUEBIRD-C', noradId: 61047, type: 'block1', weight: 1.5, color: '#FF6B35', arraySize: '64 m²', launched: '2024-09-12', correlationFrom: '2024-10-01' },
  { id: 'bb2', name: 'BlueBird 2', codename: 'BLUEBIRD-D', noradId: 61048, type: 'block1', weight: 1.5, color: '#FF6B35', arraySize: '64 m²', launched: '2024-09-12', correlationFrom: '2024-10-01' },
  { id: 'bb3', name: 'BlueBird 3', codename: 'BLUEBIRD-A', noradId: 61045, type: 'block1', weight: 1.5, color: '#FF6B35', arraySize: '64 m²', launched: '2024-09-12', correlationFrom: '2024-10-01' },
  { id: 'bb4', name: 'BlueBird 4', codename: 'BLUEBIRD-E', noradId: 61049, type: 'block1', weight: 1.5, color: '#FF6B35', arraySize: '64 m²', launched: '2024-09-12', correlationFrom: '2024-10-01' },
  { id: 'bb5', name: 'BlueBird 5', codename: 'BLUEBIRD-B', noradId: 61046, type: 'block1', weight: 1.5, color: '#FF6B35', arraySize: '64 m²', launched: '2024-09-12', correlationFrom: '2024-10-01' },
  { id: 'bb6', name: 'BlueBird 6', codename: 'BLOCK-2', noradId: 67232, type: 'block2', weight: 2.5, color: '#00FF88', arraySize: '223 m²', launched: '2025-12-24', correlationFrom: '2026-01-01' },
  { id: 'bb8', name: 'BlueBird 8', codename: 'BLUEBIRD OBJECT A', noradId: 69589, type: 'block2', weight: 2.5, color: '#00FF88', arraySize: '223 m²', launched: '2026-06-17', correlationFrom: null, unfurlNote: 'Unfurl unconfirmed by AST — excluded from correlation' },
  { id: 'bb9', name: 'BlueBird 9', codename: 'BLUEBIRD OBJECT B', noradId: 69590, type: 'block2', weight: 2.5, color: '#00FF88', arraySize: '223 m²', launched: '2026-06-17', correlationFrom: '2026-07-20', unfurlNote: 'Unfurled 2026-07-20 — correlation-eligible from 7/20' },
  { id: 'bb10', name: 'BlueBird 10', codename: 'BLUEBIRD OBJECT C', noradId: 69591, type: 'block2', weight: 2.5, color: '#00FF88', arraySize: '223 m²', launched: '2026-06-17', correlationFrom: '2026-07-20', unfurlNote: 'Unfurled 2026-07-20 — correlation-eligible from 7/20' },
];

export const NORAD_IDS = SATELLITES.map(s => s.noradId);

export const TYPE_WEIGHTS: Record<string, number> = {
  prototype: 3.5,
  block2: 2.5,
  block1: 1.5,
};

// Hardcoded fallback TLEs (Feb-Mar 2026 epoch)
// NOTE: TLE lines must be exactly 69 characters. Space before epoch field is critical.
export const FALLBACK_TLES: Record<number, { line1: string; line2: string }> = {
  53807: {
    line1: '1 53807U 22111AL  26051.69931396  .00006042  00000-0  17568-3 0  9992',
    line2: '2 53807  53.2291 220.2814 0006904 163.5512 196.5718 15.36862718192284',
  },
  61045: {
    line1: '1 61045U 24163A   26059.13578965  .00010066  00000-0  45836-3 0  9990',
    line2: '2 61045  52.9693  91.0403 0007935 162.8389 197.2875 15.21265803 81179',
  },
  61046: {
    line1: '1 61046U 24163B   26059.25115261  .00012287  00000-0  55801-3 0  9990',
    line2: '2 61046  52.9791  90.4021 0011468 151.4989 208.6634 15.21120754 81180',
  },
  61047: {
    line1: '1 61047U 24163C   26059.19347113  .00008537  00000-0  38937-3 0  9992',
    line2: '2 61047  52.9742  90.7212 0007832 163.7445 196.3827 15.21299361 81189',
  },
  61048: {
    line1: '1 61048U 24163D   26059.06010918  .00011429  00000-0  52036-3 0  9995',
    line2: '2 61048  52.9646  91.3994 0009020 160.2531 199.8859 15.21096282 81163',
  },
  61049: {
    line1: '1 61049U 24163E   26059.12471759  .00014285  00000-0  64870-3 0  9990',
    line2: '2 61049  52.9714  91.0766 0009221 159.1254 200.9135 15.21117979 81176',
  },
  67232: {
    line1: '1 67232U 25230A   26058.91253741  .00012500  00000-0  52000-3 0  9990',
    line2: '2 67232  53.0100  85.2000 0008500 155.0000 205.1500 15.22000000  9500',
  },
  69589: {
    line1: '1 69589U 26139A   26168.86759766  .00000613  00000-0  51823-4 0  9998',
    line2: '2 69589  52.9984 259.4733 0003688 322.0387  38.0343 15.12492987   974',
  },
  69590: {
    line1: '1 69590U 26139B   26168.93360786  .00000615  00000-0  51729-4 0  9995',
    line2: '2 69590  52.9957 259.1737 0003705 335.3231  24.7582 15.12664370   998',
  },
  69591: {
    line1: '1 69591U 26139C   26168.66930141  .00001603  00000-0  10726-3 0  9993',
    line2: '2 69591  52.9976 260.3752 0003918 341.5126  18.5722 15.12770881   586',
  },
};

// Elevation multipliers for scoring
export const ELEVATION_MULTIPLIERS: [number, number][] = [
  [70, 1.00],
  [45, 0.85],
  [25, 0.60],
  [10, 0.35],
];

export function getElevationMultiplier(elevDeg: number): number {
  for (const [threshold, mult] of ELEVATION_MULTIPLIERS) {
    if (elevDeg >= threshold) return mult;
  }
  return 0;
}

// Hotspot bonus weights
export const HOTSPOT_BONUS: Record<string, number> = {
  nuclear: 0.5,
  military: 0.3,
  command: 0.3,
  infrastructure: 0.2,
  naval: 0.2,
  airbase: 0.2,
  launch: 0.2,
  chokepoint: 0.2,
  default: 0.1,
};

// Syrup level thresholds
export const SYRUP_LEVELS = [
  { min: 8, label: 'DROWNING IN SYRUP', color: '#FF0040' },
  { min: 6, label: 'HEAVY POUR',        color: '#FF6B00' },
  { min: 4, label: 'LIGHT DRIZZLE',     color: '#F5A623' },
  { min: 0, label: 'DRY WAFFLE',        color: '#00FF88' },
] as const;

export function getSyrupLevel(score: number) {
  for (const level of SYRUP_LEVELS) {
    if (score >= level.min) return level;
  }
  return SYRUP_LEVELS[SYRUP_LEVELS.length - 1];
}

// Backward-compat aliases
export const WAFFLE_LEVELS = SYRUP_LEVELS;
export const getWaffleLevel = getSyrupLevel;

// Orbital constants
export const EARTH_RADIUS_KM = 6371;
export const ASTS_ALTITUDE_KM = 510;
export const ASTS_INCLINATION_DEG = 53;
export const DEFAULT_MIN_ELEVATION_DEG = 10;
export const DEFAULT_FOOTPRINT_KM = 1580;

// Whether a satellite's array is unfurled and thus usable for correlation at `date`.
export function isCorrelationEligible(meta: SatelliteMeta, date: Date): boolean {
  if (!meta.correlationFrom) return false;            // unfurl unconfirmed
  return date.getTime() >= new Date(meta.correlationFrom).getTime();
}
