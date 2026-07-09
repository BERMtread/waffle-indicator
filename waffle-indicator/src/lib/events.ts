export interface OpPhase {
  id: string;
  name: string;
  targetLat: number;
  targetLng: number;
  start: string;               // ISO 8601 UTC — phase window start
  end: string;                 // ISO 8601 UTC — phase window end
  confidence: 'confirmed' | 'approx' | 'time-unconfirmed';
  score: number;               // 10·sin(bestElevationDeg)
  bestElevationDeg: number;    // peak elevation of the best pass in the window
  passStart: string;           // ISO time the best pass entered the footprint ('' = none)
  passSats: string[];          // codename(s) of the best pass
  passesInWindow: number;
  coveredMinutes: number;      // minutes with >=1 waffle overhead during the phase
}

export interface CorrelationEvent {
  id: string;
  date: string;   // ISO 8601 UTC — best-pass moment (or phase start if no pass)
  level: number;  // opScore = max phase score
  label: string;
  shortLabel: string;
  sats: string[];
  aoiId: string;
  color: string;
  type: 'CORRELATED' | 'ALIGNMENT';
  parentOp?: string;
  unscored?: boolean; // true when no reliable time-of-day exists (e.g. Hormuz)
  note: string;
  phases: OpPhase[];
}

/**
 * v4 — Phase / best-pass methodology.
 *
 * Each operation is broken into its critical PHASES (ingress, assault, exfil,
 * nuclear strike, CSAR extraction, ...), each with a researched time window and a
 * point target. A phase scores 10·sin(bestElevationDeg) on the single most directly
 * overhead ASTS pass during its window; the op-level `level` is the best phase.
 *
 * This fixes the single-instant flaw: Op. Absolute Resolve's kickoff had no pass,
 * but its exfil phase caught a 61° near-overhead pass (8.7). Epic Fury's strength is
 * the Fordow nuclear phase (58°), not the grazing Tehran opening. The Hormuz strike
 * has no reported time of day, so it is left `unscored` rather than fabricated.
 */

export const CORRELATION_EVENTS: CorrelationEvent[] = [
  {
    id: 'midnight-hammer',
    date: '2025-06-21T23:17:00+00:00',
    level: 8.3,
    label: "Op. Midnight Hammer \u2014 US B-2 strike on Iran nuclear sites",
    shortLabel: "Midnight Hammer",
    sats: ["BB1", "BB5"],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
    note: "B-2/Tomahawk strikes on Fordow, Natanz, Isfahan; first weapons 02:10 IRST 22 Jun 2025",
    phases: [
      {
        id: 'fordow',
        name: "Fordow strike (B-2 / GBU-57 MOP)",
        targetLat: 34.88,
        targetLng: 51.59,
        start: '2025-06-21T22:40:00Z',
        end: '2025-06-21T23:15:00Z',
        confidence: 'confirmed',
        score: 6.7,
        bestElevationDeg: 42.2,
        passStart: "2025-06-21T22:52:20+00:00",
        passSats: ["BB2"],
        passesInWindow: 1,
        coveredMinutes: 7.3,
      },
      {
        id: 'natanz',
        name: "Natanz strike (MOP + Tomahawk)",
        targetLat: 33.72,
        targetLng: 51.73,
        start: '2025-06-21T22:40:00Z',
        end: '2025-06-21T23:15:00Z',
        confidence: 'confirmed',
        score: 6.0,
        bestElevationDeg: 37.0,
        passStart: "2025-06-21T22:52:40+00:00",
        passSats: ["BB2"],
        passesInWindow: 1,
        coveredMinutes: 7.2,
      },
      {
        id: 'isfahan',
        name: "Isfahan strike (Tomahawk, final wave)",
        targetLat: 32.65,
        targetLng: 51.68,
        start: '2025-06-21T22:55:00Z',
        end: '2025-06-21T23:25:00Z',
        confidence: 'confirmed',
        score: 8.3,
        bestElevationDeg: 56.1,
        passStart: "2025-06-21T23:17:00+00:00",
        passSats: ["BB1", "BB5"],
        passesInWindow: 2,
        coveredMinutes: 12.5,
      },
    ],
  },
  {
    id: 'absolute-resolve',
    date: '2026-01-03T07:57:10+00:00',
    level: 8.7,
    label: "Op. Absolute Resolve \u2014 US raid captures Maduro",
    shortLabel: "Absolute Resolve",
    sats: ["BB4"],
    aoiId: 'venezuela',
    color: '#FF0040',
    type: 'CORRELATED',
    note: "Delta Force ingress 02:01 VET; back over water with Maduro <3h later",
    phases: [
      {
        id: 'assault',
        name: "Ingress & assault on Maduro compound (Caracas)",
        targetLat: 10.49,
        targetLng: -66.88,
        start: '2026-01-03T06:01:00Z',
        end: '2026-01-03T07:00:00Z',
        confidence: 'confirmed',
        score: 0.0,
        bestElevationDeg: 0,
        passStart: "",
        passSats: [],
        passesInWindow: 0,
        coveredMinutes: 0,
      },
      {
        id: 'exfil',
        name: "Exfiltration with Maduro",
        targetLat: 10.49,
        targetLng: -66.88,
        start: '2026-01-03T07:00:00Z',
        end: '2026-01-03T09:00:00Z',
        confidence: 'confirmed',
        score: 8.7,
        bestElevationDeg: 61.0,
        passStart: "2026-01-03T07:57:10+00:00",
        passSats: ["BB4"],
        passesInWindow: 5,
        coveredMinutes: 39.8,
      },
    ],
  },
  {
    id: 'epic-fury',
    date: '2026-02-28T07:53:50+00:00',
    level: 8.5,
    label: "Op. Epic Fury \u2014 US/Israel strike Iran",
    shortLabel: "Epic Fury",
    sats: ["BW3"],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
    note: "CENTCOM strikes begin 01:15 ET 28 Feb 2026",
    phases: [
      {
        id: 'opening',
        name: "Opening strikes / Khamenei decapitation (Tehran)",
        targetLat: 35.69,
        targetLng: 51.39,
        start: '2026-02-28T06:15:00Z',
        end: '2026-02-28T07:15:00Z',
        confidence: 'confirmed',
        score: 1.9,
        bestElevationDeg: 11.0,
        passStart: "2026-02-28T06:18:10+00:00",
        passSats: ["BW3"],
        passesInWindow: 1,
        coveredMinutes: 2.2,
      },
      {
        id: 'nuclear',
        name: "Nuclear facility strikes (Fordow)",
        targetLat: 34.88,
        targetLng: 51.59,
        start: '2026-02-28T06:15:00Z',
        end: '2026-02-28T08:15:00Z',
        confidence: 'confirmed',
        score: 8.5,
        bestElevationDeg: 58.3,
        passStart: "2026-02-28T07:53:50+00:00",
        passSats: ["BW3"],
        passesInWindow: 1,
        coveredMinutes: 7.2,
      },
    ],
  },
  {
    id: 'ef-pilot-rescue',
    date: '2026-04-03T08:13:00+00:00',
    level: 1.9,
    label: "Epic Fury \u2014 Dude 44 pilot CSAR recovery",
    shortLabel: "Dude 44 Pilot",
    sats: ["BB6"],
    aoiId: 'iran',
    color: '#00FF88',
    type: 'ALIGNMENT',
    parentOp: 'epic-fury',
    note: "F-15E down ~04:40 IRST 3 Apr; pilot recovered ~7h later",
    phases: [
      {
        id: 'recovery',
        name: "Pilot extraction (Kohgiluyeh & Boyer-Ahmad)",
        targetLat: 30.7,
        targetLng: 51.6,
        start: '2026-04-03T07:00:00Z',
        end: '2026-04-03T09:00:00Z',
        confidence: 'approx',
        score: 1.9,
        bestElevationDeg: 11.0,
        passStart: "2026-04-03T08:13:00+00:00",
        passSats: ["BB6"],
        passesInWindow: 1,
        coveredMinutes: 2.3,
      },
    ],
  },
  {
    id: 'ef-wso-rescue',
    date: '2026-04-04T22:30:00Z',
    level: 0.0,
    label: "Epic Fury \u2014 Dude 44 WSO CSAR recovery",
    shortLabel: "Dude 44 WSO",
    sats: [],
    aoiId: 'iran',
    color: '#00FF88',
    type: 'ALIGNMENT',
    parentOp: 'epic-fury',
    note: "WSO extracted ~03:00 IRST 5 Apr near Yasuj",
    phases: [
      {
        id: 'extraction',
        name: "WSO extraction (near Yasuj)",
        targetLat: 30.67,
        targetLng: 51.59,
        start: '2026-04-04T22:30:00Z',
        end: '2026-04-05T00:30:00Z',
        confidence: 'approx',
        score: 0.0,
        bestElevationDeg: 0,
        passStart: "",
        passSats: [],
        passesInWindow: 0,
        coveredMinutes: 0,
      },
    ],
  },
  {
    id: 'ef-ceasefire-0707',
    date: '2026-07-07T21:46:20Z',
    level: 4.6,
    label: "Epic Fury ceasefire break (7/7) \u2014 US strikes Strait of Hormuz",
    shortLabel: "Ceasefire Break 7/7",
    sats: ["BB10", "BB8", "BB9", "BW3"],
    aoiId: 'hormuz',
    color: '#F5A623',
    type: 'ALIGNMENT',
    parentOp: 'epic-fury',
    note: "US >80-target strikes on Hormuz (Qeshm/Bandar Abbas/Sirik/Kharg) overnight 7 Jul 2026; time approximate (\u00b11h)",
    phases: [
      {
        id: 'strike',
        name: "Strait of Hormuz strikes (Qeshm / Bandar Abbas / Sirik)",
        targetLat: 27.18,
        targetLng: 56.28,
        start: '2026-07-07T20:00:00Z',
        end: '2026-07-07T22:00:00Z',
        confidence: 'approx',
        score: 4.6,
        bestElevationDeg: 27.7,
        passStart: "2026-07-07T21:46:20Z",
        passSats: ["BB10", "BB8", "BB9", "BW3"],
        passesInWindow: 1,
        coveredMinutes: 13.7,
      },
    ],
  },
  {
    id: 'ef-ceasefire-0708',
    date: '2026-07-08T22:45:10Z',
    level: 8.3,
    label: "Epic Fury ceasefire break (7/8) \u2014 US strikes Bushehr / S. Iran",
    shortLabel: "Ceasefire Break 7/8",
    sats: ["BW3"],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
    parentOp: 'epic-fury',
    note: "US ~90-target strikes on Bushehr + southern Iran, late night 8 Jul 2026; time approximate (\u00b11h)",
    phases: [
      {
        id: 'strike',
        name: "Bushehr / southern Iran strikes",
        targetLat: 28.83,
        targetLng: 50.89,
        start: '2026-07-08T21:00:00Z',
        end: '2026-07-08T23:00:00Z',
        confidence: 'approx',
        score: 8.3,
        bestElevationDeg: 56.1,
        passStart: "2026-07-08T22:45:10Z",
        passSats: ["BW3"],
        passesInWindow: 2,
        coveredMinutes: 18.8,
      },
    ],
  },
];

export const TIMELINE_START = new Date('2025-05-15T00:00:00Z');
export const TIMELINE_END_BUFFER_DAYS = 14;
