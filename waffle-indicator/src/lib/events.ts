export interface CriticalMoment {
  targetName: string;
  targetLat: number;
  targetLng: number;
  coveredAtMoment: boolean;      // was ≥1 waffle overhead the target at the exact critical instant
  satsAtMoment: string[];        // codenames overhead at t0
  bestElevAtMomentDeg: number;   // best look angle at t0 (0 if none overhead)
  nearestPassGapMin: number;     // minutes to the nearest instant the target is inside a footprint
  nearestPassSignedMin: number | null; // negative = pass before t0, positive = after (null = none within window)
  nearestPassSats: string[];     // codename(s) of the nearest pass
  nearestPassElevDeg: number;    // best look angle of the nearest pass
  passesInWindow: number;        // distinct passes over the target within the search window
  windowMin: number;             // search window width (minutes)
  timeConfidence: 'confirmed' | 'approx' | 'unconfirmed-time';
  note: string;                  // sourcing note on the critical timestamp
}

export interface CorrelationEvent {
  id: string;
  date: string; // ISO 8601 UTC — the critical moment (op kickoff / extraction)
  level: number; // criticalScore 0–10 = 10·exp(-gap/15)
  label: string;
  shortLabel: string;
  sats: string[];
  aoiId: string;
  color: string;
  type: 'CORRELATED' | 'ALIGNMENT';
  parentOp?: string;
  critical?: CriticalMoment;
}

/**
 * v3 — Critical-moment methodology. Scope narrowed to three real operations plus
 * the Epic Fury sub-events, each scored on a single question: at the exact critical
 * instant, was an ASTS waffle overhead the specific target — and if not, how close
 * in time was the nearest pass? level = 10·exp(-gap/15). See critical-moment.ts.
 *
 * All timestamps are researched to the reported kickoff/extraction time (UTC).
 * Rescue times are approximate (±); the Hormuz self-defense strike has no reported
 * time of day (timeConfidence flags this per event).
 */

export const CORRELATION_EVENTS: CorrelationEvent[] = [
  {
    id: 'rising-lion',
    date: '2025-06-12T23:30:00Z',
    level: 0.1,
    label: 'Op. Rising Lion — Israel opens strikes on Iran',
    shortLabel: 'Rising Lion',
    sats: ["BB5", "BB1"],
    aoiId: 'iran',
    color: '#00FF88',
    type: 'ALIGNMENT',
    critical: {
      targetName: "Tehran (leadership/air-defense, first wave)",
      targetLat: 35.69,
      targetLng: 51.39,
      coveredAtMoment: false,
      satsAtMoment: [],
      bestElevAtMomentDeg: 0.0,
      nearestPassGapMin: 69.8,
      nearestPassSignedMin: 69.8,
      nearestPassSats: ["BB5", "BB1"],
      nearestPassElevDeg: 10.3,
      passesInWindow: 4,
      windowMin: 240,
      timeConfidence: 'confirmed',
      note: "First IAF wave ~03:00 IRST 13 Jun 2025",
    },
  },
  {
    id: 'absolute-resolve',
    date: '2026-01-03T06:01:00Z',
    level: 0.1,
    label: 'Op. Absolute Resolve — US raid captures Maduro',
    shortLabel: 'Absolute Resolve',
    sats: ["BB1"],
    aoiId: 'venezuela',
    color: '#00FF88',
    type: 'ALIGNMENT',
    critical: {
      targetName: "Caracas (Maduro compound)",
      targetLat: 10.49,
      targetLng: -66.88,
      coveredAtMoment: false,
      satsAtMoment: [],
      bestElevAtMomentDeg: 0.0,
      nearestPassGapMin: 66.5,
      nearestPassSignedMin: 66.5,
      nearestPassSats: ["BB1"],
      nearestPassElevDeg: 10.2,
      passesInWindow: 4,
      windowMin: 240,
      timeConfidence: 'confirmed',
      note: "Delta Force crossed into VE airspace 02:01 VET 3 Jan 2026",
    },
  },
  {
    id: 'epic-fury',
    date: '2026-02-28T06:15:00Z',
    level: 8.1,
    label: 'Op. Epic Fury — US/Israel open strikes on Iran',
    shortLabel: 'Epic Fury',
    sats: ["BW3"],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
    critical: {
      targetName: "Tehran (Khamenei/command nodes)",
      targetLat: 35.69,
      targetLng: 51.39,
      coveredAtMoment: false,
      satsAtMoment: [],
      bestElevAtMomentDeg: 0.0,
      nearestPassGapMin: 3.2,
      nearestPassSignedMin: 3.2,
      nearestPassSats: ["BW3"],
      nearestPassElevDeg: 10.3,
      passesInWindow: 3,
      windowMin: 240,
      timeConfidence: 'confirmed',
      note: "CENTCOM airstrikes begin 01:15 ET 28 Feb 2026",
    },
  },
  {
    id: 'ef-pilot-rescue',
    date: '2026-04-03T08:10:00Z',
    level: 8.2,
    label: 'Epic Fury — Dude 44 pilot CSAR recovery',
    shortLabel: 'Dude 44 Pilot',
    sats: ["BB6"],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
    parentOp: 'epic-fury',
    critical: {
      targetName: "Kohgiluyeh & Boyer-Ahmad (Dude 44 pilot)",
      targetLat: 30.7,
      targetLng: 51.6,
      coveredAtMoment: false,
      satsAtMoment: [],
      bestElevAtMomentDeg: 0.0,
      nearestPassGapMin: 3.0,
      nearestPassSignedMin: 3.0,
      nearestPassSats: ["BB6"],
      nearestPassElevDeg: 10.2,
      passesInWindow: 3,
      windowMin: 240,
      timeConfidence: 'approx',
      note: "F-15E down ~04:40 IRST; pilot recovered ~7h later, 3 Apr 2026",
    },
  },
  {
    id: 'ef-wso-rescue',
    date: '2026-04-04T23:30:00Z',
    level: 0.0,
    label: 'Epic Fury — Dude 44 WSO CSAR recovery',
    shortLabel: 'Dude 44 WSO',
    sats: [],
    aoiId: 'iran',
    color: '#00FF88',
    type: 'ALIGNMENT',
    parentOp: 'epic-fury',
    critical: {
      targetName: "Near Yasuj (Dude 44 WSO)",
      targetLat: 30.67,
      targetLng: 51.59,
      coveredAtMoment: false,
      satsAtMoment: [],
      bestElevAtMomentDeg: 0.0,
      nearestPassGapMin: 120.0,
      nearestPassSignedMin: null,
      nearestPassSats: [],
      nearestPassElevDeg: 0.0,
      passesInWindow: 0,
      windowMin: 240,
      timeConfidence: 'approx',
      note: "WSO recovered ~03:00 IRST 5 Apr 2026 near Yasuj",
    },
  },
  {
    id: 'ef-hormuz-strike',
    date: '2026-05-25T12:00:00Z',
    level: 1.1,
    label: 'Epic Fury ceasefire — US Hormuz self-defense strikes',
    shortLabel: 'Hormuz Strikes',
    sats: ["BB6"],
    aoiId: 'hormuz',
    color: '#00FF88',
    type: 'ALIGNMENT',
    parentOp: 'epic-fury',
    critical: {
      targetName: "Bandar Abbas / Strait of Hormuz",
      targetLat: 27.18,
      targetLng: 56.28,
      coveredAtMoment: false,
      satsAtMoment: [],
      bestElevAtMomentDeg: 0.0,
      nearestPassGapMin: 33.0,
      nearestPassSignedMin: -33.0,
      nearestPassSats: ["BB6"],
      nearestPassElevDeg: 10.5,
      passesInWindow: 4,
      windowMin: 240,
      timeConfidence: 'unconfirmed-time',
      note: "US 'self-defense' strikes on IRGC boats + Bandar Abbas SAM, 25 May 2026 (time of day not reported)",
    },
  },
];

export const TIMELINE_START = new Date('2025-05-15T00:00:00Z');
export const TIMELINE_END_BUFFER_DAYS = 14;
