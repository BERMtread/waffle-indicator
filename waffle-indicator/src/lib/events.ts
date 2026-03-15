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
}

export const CORRELATION_EVENTS: CorrelationEvent[] = [
  {
    id: 'sindoor',
    date: '2025-05-06T19:35:00Z', // 1:05 AM IST May 7 — first missile strikes (Carnegie/PIB)
    level: 7.0,
    label: 'Op. Sindoor — India Strikes Pakistan',
    shortLabel: 'Sindoor',
    sats: ['BW3', 'BB4'],
    aoiId: 'pakistan-nuclear',
    color: '#FF6B00',
    type: 'CORRELATED',
  },
  {
    id: 'rising-lion',
    date: '2025-06-12T20:30:00Z', // ~midnight IRST June 13 — first drone/strike wave (CNN/CSIS)
    level: 9.2,
    label: 'Op. Rising Lion — Israel Strikes Iran',
    shortLabel: 'Rising Lion',
    sats: ['BW3', 'BB3', 'BB5'],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
  },
  {
    id: 'scarborough',
    date: '2025-08-11T04:00:00Z', // Aug 11 — CCG/PLAN pursuit & collision; exact hour unconfirmed (USNI/Al Jazeera)
    level: 4.5,
    label: 'Scarborough Shoal Collision — SCS',
    shortLabel: 'Scarborough',
    sats: ['BB2', 'BB3', 'BB4'],
    aoiId: 'south-china-sea',
    color: '#FFB800',
    type: 'ALIGNMENT',
  },
  {
    id: 'el-fasher',
    date: '2025-10-26T03:00:00Z', // Oct 26 dawn local — RSF final assault/massacre begins; exact hour unconfirmed (HRW/UN)
    level: 6.2,
    label: 'RSF Captures El Fasher — Sudan',
    shortLabel: 'El Fasher',
    sats: ['BB3', 'BB4'],
    aoiId: 'sudan',
    color: '#FF6B00',
    type: 'CORRELATED',
  },
  {
    id: 'taiwan-blockade',
    date: '2025-12-28T23:30:00Z', // 7:30 AM Beijing Dec 29 — PLA Eastern Theater Command announcement (Global Taiwan Inst/CNN)
    level: 8.1,
    label: 'PLA Justice Mission 2025 — Taiwan Blockade',
    shortLabel: 'Taiwan',
    sats: ['BB1', 'BB3', 'BB6'],
    aoiId: 'taiwan-strait',
    color: '#FF0040',
    type: 'CORRELATED',
  },
  {
    id: 'venezuela',
    date: '2026-01-03T06:01:00Z', // 1:01 AM EST / 2:01 AM VET — Delta Force at Maduro compound (Gen. Caine briefing)
    level: 5.6,
    label: 'Op. Absolute Resolve — US Captures Maduro',
    shortLabel: 'Venezuela',
    sats: ['BB1', 'BB3', 'BB6'],
    aoiId: 'venezuela',
    color: '#FF6B00',
    type: 'CORRELATED',
  },
  {
    id: 'dprk-salvo',
    date: '2026-01-03T22:50:00Z', // 7:50 AM KST Jan 4 — ROK JCS detection (NK News/Bloomberg/Korea Times)
    level: 4.8,
    label: 'DPRK Ballistic Missile Salvo',
    shortLabel: 'DPRK',
    sats: ['BW3', 'BB1', 'BB3', 'BB6'],
    aoiId: 'north-korea',
    color: '#FFB800',
    type: 'ALIGNMENT',
  },
  {
    id: 'ukraine-barrage',
    date: '2026-02-02T22:24:00Z', // 00:24 Kyiv Feb 3 — first air raid alert; drones since evening Feb 2 (RBC-Ukraine/Kyiv Independent)
    level: 7.4,
    label: 'Russia 450-Drone Barrage — Ukraine Energy',
    shortLabel: 'Ukraine',
    sats: ['BB2', 'BB4', 'BB6'],
    aoiId: 'ukraine-east',
    color: '#FF0040',
    type: 'CORRELATED',
  },
  {
    id: 'epic-fury',
    date: '2026-02-28T06:15:00Z', // 1:15 AM EST / 9:45 AM IRST — first strikes (SOF News/CENTCOM)
    level: 9.8,
    label: 'Op. Epic Fury — US/Israel Strike Iran',
    shortLabel: 'Epic Fury',
    sats: ['BB1', 'BB2', 'BB4'],
    aoiId: 'iran',
    color: '#FF0040',
    type: 'CORRELATED',
  },
];

// Timeline range
export const TIMELINE_START = new Date('2025-04-01T00:00:00Z');
export const TIMELINE_END_BUFFER_DAYS = 7; // extend past latest event
