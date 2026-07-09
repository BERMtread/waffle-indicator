export interface CoverageMetrics {
  dwellMin: number;          // minutes ≥1 sat covered the AOI over a ±12h window
  coveragePct: number;       // dwellMin as % of the 24h window
  passes: number;            // distinct coverage intervals (revisits) in the window
  maxConcurrent: number;     // peak simultaneous satellites overhead
  satsAtEventMinute: number; // sats actually overhead at the reported strike minute
  medianGapMin: number | null; // median revisit gap between passes
  meanDailyDwellMin: number; // mean daily dwell on adjacent (control) days
  typicalityRatio: number;   // event-window dwell / mean daily dwell (≈1 ⇒ ordinary day)
}

export interface CorrelationEvent {
  id: string;
  date: string; // ISO 8601 UTC
  level: number;
  label: string;
  shortLabel: string;
  sats: string[];
  aoiId: string;
  color: string;
  type: 'CORRELATED' | 'ALIGNMENT';
  coverage?: CoverageMetrics;
}

/**
 * v2 — Coverage-duration methodology.
 *
 * `level` is now a real, reproducible COVERAGE SCORE (0–10) computed from actual
 * Space-Track historical TLEs (SGP4-propagated across a ±12h window around each
 * event), combining dwell time (how long the AOI is covered) and revisit cadence
 * (how often) — NOT the old instantaneous "how many waffles are stacked" reading.
 *
 * Important caveat surfaced by this recompute: `typicalityRatio` ≈ 1.0 for every
 * event, i.e. coverage during each operation window is statistically identical to
 * coverage on ordinary adjacent days. The Block-1 BlueBirds fly as a single-plane
 * train, so these AOIs are covered ~13–26% of *every* day regardless of events.
 * Treat `level` as a descriptive coverage-intensity metric, not a predictive signal.
 */

export const CORRELATION_EVENTS: CorrelationEvent[] = [
  {
    id: 'sindoor',
    date: '2025-05-06T19:35:00Z',
    level: 5.3,
    label: 'Op. Sindoor — India Strikes Pakistan',
    shortLabel: 'Sindoor',
    sats: ["BB2", "BB5", "BB1"],
    aoiId: 'pakistan-nuclear',
    color: '#F5A623',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 219.5,
      coveragePct: 15.2,
      passes: 29,
      maxConcurrent: 2,
      satsAtEventMinute: 0,
      medianGapMin: 16.5,
      meanDailyDwellMin: 204.7,
      typicalityRatio: 1.07,
    },
  },
  {
    id: 'rising-lion',
    date: '2025-06-12T20:30:00Z',
    level: 7.1,
    label: 'Op. Rising Lion — Israel Strikes Iran',
    shortLabel: 'Rising Lion',
    sats: ["BB3", "BB2", "BB4"],
    aoiId: 'iran',
    color: '#FF6B00',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 308.0,
      coveragePct: 21.4,
      passes: 36,
      maxConcurrent: 2,
      satsAtEventMinute: 1,
      medianGapMin: 15.5,
      meanDailyDwellMin: 303.8,
      typicalityRatio: 1.01,
    },
  },
  {
    id: 'scarborough',
    date: '2025-08-11T04:00:00Z',
    level: 5.1,
    label: 'Scarborough Shoal Collision — SCS',
    shortLabel: 'Scarborough',
    sats: ["BB4", "BB3", "BW3"],
    aoiId: 'south-china-sea',
    color: '#F5A623',
    type: 'ALIGNMENT',
    coverage: {
      dwellMin: 233.5,
      coveragePct: 16.2,
      passes: 25,
      maxConcurrent: 2,
      satsAtEventMinute: 0,
      medianGapMin: 15.5,
      meanDailyDwellMin: 224.5,
      typicalityRatio: 1.04,
    },
  },
  {
    id: 'el-fasher',
    date: '2025-10-26T03:00:00Z',
    level: 4.8,
    label: 'RSF Captures El Fasher — Sudan',
    shortLabel: 'El Fasher',
    sats: ["BB4", "BB3", "BB2"],
    aoiId: 'sudan',
    color: '#F5A623',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 214.5,
      coveragePct: 14.9,
      passes: 24,
      maxConcurrent: 2,
      satsAtEventMinute: 1,
      medianGapMin: 14.0,
      meanDailyDwellMin: 224.3,
      typicalityRatio: 0.96,
    },
  },
  {
    id: 'taiwan-blockade',
    date: '2025-12-28T23:30:00Z',
    level: 4.9,
    label: 'PLA Justice Mission 2025 — Taiwan Blockade',
    shortLabel: 'Taiwan',
    sats: ["BB2", "BB1", "BB6"],
    aoiId: 'taiwan-strait',
    color: '#F5A623',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 198.0,
      coveragePct: 13.8,
      passes: 27,
      maxConcurrent: 2,
      satsAtEventMinute: 0,
      medianGapMin: 16.5,
      meanDailyDwellMin: 181.7,
      typicalityRatio: 1.09,
    },
  },
  {
    id: 'venezuela',
    date: '2026-01-03T06:01:00Z',
    level: 4.2,
    label: 'Op. Absolute Resolve — US Captures Maduro',
    shortLabel: 'Venezuela',
    sats: ["BB4", "BB5", "BB6"],
    aoiId: 'venezuela',
    color: '#F5A623',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 183.5,
      coveragePct: 12.7,
      passes: 22,
      maxConcurrent: 2,
      satsAtEventMinute: 0,
      medianGapMin: 17.5,
      meanDailyDwellMin: 188.3,
      typicalityRatio: 0.97,
    },
  },
  {
    id: 'dprk-salvo',
    date: '2026-01-03T22:50:00Z',
    level: 6.3,
    label: 'DPRK Ballistic Missile Salvo',
    shortLabel: 'DPRK',
    sats: ["BB2", "BB3", "BB4"],
    aoiId: 'north-korea',
    color: '#FF6B00',
    type: 'ALIGNMENT',
    coverage: {
      dwellMin: 278.0,
      coveragePct: 19.3,
      passes: 32,
      maxConcurrent: 2,
      satsAtEventMinute: 0,
      medianGapMin: 17.5,
      meanDailyDwellMin: 291.3,
      typicalityRatio: 0.95,
    },
  },
  {
    id: 'ukraine-barrage',
    date: '2026-02-02T22:24:00Z',
    level: 5.9,
    label: 'Russia 450-Drone Barrage — Ukraine Energy',
    shortLabel: 'Ukraine',
    sats: ["BB6", "BB1", "BB2"],
    aoiId: 'ukraine-east',
    color: '#F5A623',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 264.0,
      coveragePct: 18.3,
      passes: 29,
      maxConcurrent: 3,
      satsAtEventMinute: 0,
      medianGapMin: 18.0,
      meanDailyDwellMin: 252.0,
      typicalityRatio: 1.05,
    },
  },
  {
    id: 'epic-fury',
    date: '2026-02-28T06:15:00Z',
    level: 8.4,
    label: 'Op. Epic Fury — US/Israel Strike Iran',
    shortLabel: 'Epic Fury',
    sats: ["BB4", "BB6", "BB5"],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
    coverage: {
      dwellMin: 380.5,
      coveragePct: 26.4,
      passes: 41,
      maxConcurrent: 3,
      satsAtEventMinute: 0,
      medianGapMin: 14.0,
      meanDailyDwellMin: 363.2,
      typicalityRatio: 1.05,
    },
  },
];

// Timeline range
export const TIMELINE_START = new Date('2025-04-01T00:00:00Z');
export const TIMELINE_END_BUFFER_DAYS = 7; // extend past latest event
