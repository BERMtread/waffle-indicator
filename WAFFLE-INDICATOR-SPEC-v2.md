# 🧇 WAFFLE INDICATOR — Production Specification v2.0

**Version:** 2.0  
**Last Updated:** March 1, 2026  
**Status:** Ready for Development  
**Hosting Target:** Vercel (Next.js)  
**Repository:** `waffle-indicator`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Data Sources & Pipeline](#3-data-sources--pipeline)
4. [AOI Geometry System](#4-aoi-geometry-system)
5. [Global AOI Database — 55 Zones](#5-global-aoi-database--55-zones)
6. [Orbital Propagation Engine](#6-orbital-propagation-engine)
7. [Waffle Level Scoring Algorithm](#7-waffle-level-scoring-algorithm)
8. [Forward Prediction Engine](#8-forward-prediction-engine)
9. [Database Schema](#9-database-schema)
10. [API Endpoints](#10-api-endpoints)
11. [Frontend Design System](#11-frontend-design-system)
12. [Real-Time Update Strategy](#12-real-time-update-strategy)
13. [Alert System](#13-alert-system)
14. [Performance Targets](#14-performance-targets)
15. [SEO & Social Sharing](#15-seo--social-sharing)
16. [Deployment Checklist](#16-deployment-checklist)
17. [Environment Variables](#17-environment-variables)
18. [Risks & Mitigations](#18-risks--mitigations)
19. [Key Constants & Formulas](#19-key-constants--formulas)

---

## 1. Executive Summary

The Waffle Indicator is a real-time OSINT dashboard that tracks AST SpaceMobile ($ASTS) satellite constellation alignment over geopolitical Areas of Interest (AOIs). The thesis: because LEO orbital geometry is deterministic, satellite access windows can be predicted in advance — making this a *leading* geopolitical indicator vs. the Pentagon Pizza Index (a lagging indicator based on late-night pizza deliveries near the Pentagon).

**Core insight:** AST SpaceMobile satellites have massive phased-array antennas that look like waffles. When multiple "waffles" align over a hotspot like Iran, it creates a coverage window. In February 2025, this BW3/BB1 tag-team formation aligned with two military operations (Op. Absolute Resolve and Op. Midnight Hammer) with a random coincidence probability of <1%.

**Two audiences:**

1. **Retail investors / WSB community** — meme-grade presentation of a legitimate orbital mechanics thesis around $ASTS as a defense/intelligence asset
2. **OSINT analysts** — genuine tool for monitoring and predicting ASTS constellation coverage over 55 global AOIs, with real TLE data and SGP4 propagation

---

## 2. Technical Architecture

### 2.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | SSR for SEO, API routes for TLE proxy, ISR for static pages |
| Language | TypeScript (strict) | Type safety for orbital math, polygon geometry |
| Styling | Tailwind CSS + CSS variables | Rapid iteration on terminal aesthetic |
| Orbital Engine | `satellite.js` v5+ | Full SGP4/SDP4 propagation, TLE/OMM parsing |
| Geometry Engine | `@turf/turf` | Polygon intersection, footprint circles, point-in-polygon |
| AOI Borders | Natural Earth GeoJSON | ne_110m_admin_0_countries (simplified country polygons) |
| 3D Globe (Phase 5) | CesiumJS or Three.js + globe.gl | Premium visualization layer |
| 2D Map | HTML Canvas (custom) | Lightweight equirectangular projection with polygon rendering |
| Charts | Recharts or D3 | Timeline + alignment history + prediction Gantt |
| Database | Supabase (PostgreSQL + PostGIS) | TLE history, alignment events, polygon storage |
| Cache | Vercel KV (Redis) | TLE caching, position caching, rate limit management |
| Cron | Vercel Cron Functions | Scheduled TLE fetches, alignment scans, prediction regeneration |
| Alerts | Discord webhook + Telegram Bot API | Push notifications on high waffle levels |
| Analytics | Vercel Analytics + PostHog | Usage tracking, feature flags |
| Deployment | Vercel | Git-push deploy, edge functions, cron |

### 2.2 Project Structure

```
waffle-indicator/
├── app/
│   ├── layout.tsx                 # Root layout, fonts, metadata
│   ├── page.tsx                   # Landing / dashboard
│   ├── tracker/
│   │   └── page.tsx               # Full tracker view (main page)
│   ├── intel/
│   │   └── page.tsx               # Intel / thesis page
│   ├── predictions/
│   │   └── page.tsx               # Forward prediction timeline
│   ├── aoi/
│   │   └── [id]/
│   │       └── page.tsx           # Per-AOI deep dive page
│   ├── api/
│   │   ├── tle/
│   │   │   └── route.ts           # TLE proxy endpoint
│   │   ├── positions/
│   │   │   └── route.ts           # Current satellite positions
│   │   ├── alignment/
│   │   │   └── route.ts           # Current alignment scan
│   │   ├── alignment/
│   │   │   └── history/
│   │   │       └── route.ts       # Historical alignment events
│   │   ├── predict/
│   │   │   └── route.ts           # Forward prediction engine
│   │   ├── access-windows/
│   │   │   └── route.ts           # Per-satellite access windows
│   │   ├── alerts/
│   │   │   └── route.ts           # Webhook dispatch + subscription
│   │   └── cron/
│   │       ├── fetch-tle/
│   │       │   └── route.ts       # Scheduled TLE updates (every 4h)
│   │       ├── scan-alignment/
│   │       │   └── route.ts       # Alignment checks (every 15m)
│   │       └── regenerate-predictions/
│   │           └── route.ts       # Prediction refresh (every 4h)
│   └── embed/
│       └── page.tsx               # Embeddable widget for Twitter/Reddit
├── lib/
│   ├── orbital/
│   │   ├── propagator.ts          # satellite.js wrapper
│   │   ├── tle-parser.ts          # TLE fetch + parse + cache
│   │   ├── access-window.ts       # AOI visibility calculator
│   │   ├── alignment-scorer.ts    # Waffle Level computation
│   │   ├── predictor.ts           # Forward propagation engine
│   │   └── constants.ts           # Satellite catalog
│   ├── geo/
│   │   ├── aoi-polygons.ts        # Full 55-AOI polygon database
│   │   ├── aoi-database.ts        # AOI metadata, categories, tags
│   │   ├── coverage-check.ts      # Polygon intersection engine
│   │   ├── footprint.ts           # Satellite footprint computation
│   │   ├── haversine.ts           # Great-circle distance
│   │   └── natural-earth.ts       # GeoJSON border loader
│   ├── db/
│   │   ├── client.ts              # Supabase + PostGIS client
│   │   ├── schema.sql             # Database schema
│   │   └── queries.ts             # Common queries
│   ├── alerts/
│   │   ├── discord.ts             # Discord webhook
│   │   └── telegram.ts            # Telegram bot
│   └── utils/
│       ├── time.ts                # UTC/Julian date helpers
│       └── format.ts              # Number/date formatting
├── data/
│   ├── ne_110m_countries.json     # Natural Earth simplified borders
│   ├── aoi-overrides.json         # Hand-drawn polygon overrides for sub-country AOIs
│   └── satellite-catalog.json     # ASTS constellation metadata
├── components/
│   ├── map/
│   │   ├── GroundTrackCanvas.tsx   # 2D equirectangular map w/ polygon rendering
│   │   ├── GlobeView.tsx           # 3D CesiumJS globe (Phase 5)
│   │   ├── AOIPolygonOverlay.tsx   # Rendered country/region polygons
│   │   ├── FootprintCircle.tsx     # Satellite footprint visualization
│   │   └── SatelliteMarker.tsx     # Waffle grid icon renderer
│   ├── dashboard/
│   │   ├── WaffleLevel.tsx         # Main alignment gauge
│   │   ├── StatsRow.tsx            # KPI cards
│   │   ├── SatelliteTable.tsx      # Constellation status table
│   │   ├── EventTimeline.tsx       # Historical alignment events
│   │   ├── PredictionTimeline.tsx  # Future alignment Gantt chart
│   │   ├── AOISelector.tsx         # Region/tier filter + map click select
│   │   ├── HotspotPanel.tsx        # Nuclear facilities, bases in-footprint
│   │   └── Ticker.tsx              # Scrolling news ticker
│   ├── intel/
│   │   ├── ThesisSection.tsx       # Pizza vs Waffle thesis
│   │   ├── StatisticalEvidence.tsx # P-value breakdown
│   │   └── OpsTimeline.tsx         # Military operation timelines
│   └── ui/
│       ├── Terminal.tsx            # Terminal-style text wrapper
│       ├── BlinkText.tsx           # Animated alert text
│       └── PulseRing.tsx           # Pulsing AOI indicator
├── hooks/
│   ├── useOrbitalPropagation.ts    # Real-time position updates
│   ├── useWaffleLevel.ts           # Alignment score computation
│   ├── usePolygonCoverage.ts       # Real-time polygon intersection checks
│   ├── useTLEData.ts               # TLE fetching + caching
│   └── useAnimationFrame.ts        # requestAnimationFrame wrapper
├── public/
│   ├── og-image.png                # Open Graph social card
│   └── favicon.ico                 # Waffle emoji favicon
├── vercel.json                     # Cron config, headers, rewrites
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.3 Vercel Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-tle",
      "schedule": "0 */4 * * *"
    },
    {
      "path": "/api/cron/scan-alignment",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/regenerate-predictions",
      "schedule": "30 */4 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate=300" }
      ]
    }
  ]
}
```

### 2.4 Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "satellite.js": "^5.0.0",
    "@turf/turf": "^7.0.0",
    "@turf/boolean-intersects": "^7.0.0",
    "@turf/circle": "^7.0.0",
    "@turf/simplify": "^7.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@vercel/kv": "^1.0.0",
    "recharts": "^2.0.0",
    "d3": "^7.0.0"
  }
}
```

---

## 3. Data Sources & Pipeline

### 3.1 ASTS Satellite Catalog

| ID | Name | NORAD | Type | Weight | Launched | Array Size | Notes |
|----|------|-------|------|--------|----------|------------|-------|
| BW3 | BlueWalker 3 | 53807 | Prototype | 3.5 | 2022-09-11 | 64 m² (693 ft²) | OG Waffle — proven operational correlation |
| BB1 | BlueBird 1 (C) | 61047 | Block 1 | 1.5 | 2024-09-12 | 64 m² | First operational batch |
| BB2 | BlueBird 2 (D) | 61048 | Block 1 | 1.5 | 2024-09-12 | 64 m² | |
| BB3 | BlueBird 3 (A) | 61045 | Block 1 | 1.5 | 2024-09-12 | 64 m² | |
| BB4 | BlueBird 4 (E) | 61049 | Block 1 | 1.5 | 2024-09-12 | 64 m² | |
| BB5 | BlueBird 5 (B) | 61046 | Block 1 | 1.5 | 2024-09-12 | 64 m² | |
| BB6 | BlueBird 6 | 67232 | Block 2 | 2.5 | 2025-12-24 | 223 m² (2,400 ft²) | 3.5x larger array |

**Weight** = Waffle Level scoring weight. BW3 has highest weight due to proven operational correlation. Block 2 elevated due to 3.5x larger array.

As new ASTS satellites launch (targeting 45-60 by end of 2026), catalog must be updated. Monitor via AST SpaceMobile investor relations and CelesTrak new-launches feed.

### 3.2 TLE Data Sources

**Primary: CelesTrak (no auth required)**
```
GET https://celestrak.org/NORAD/elements/gp.php?CATNR=53807&FORMAT=tle
GET https://celestrak.org/NORAD/elements/gp.php?CATNR=53807&FORMAT=json
```
Rate limit ~100 req/hr. Updates every 4-8 hours.

**Secondary: Space-Track (free account required)**
```
POST https://www.space-track.org/ajaxauth/login
GET  https://www.space-track.org/basicspacedata/query/class/gp/NORAD_CAT_ID/53807/format/tle
```
More frequent updates. 30 req/min, 300 req/hr. Store credentials in Vercel env vars.

**TLE Proxy API Route:**

```typescript
// app/api/tle/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const NORAD_IDS = [53807, 61045, 61046, 61047, 61048, 61049, 67232];
const CACHE_TTL = 4 * 60 * 60; // 4 hours

export async function GET() {
  const cached = await kv.get('tle:latest');
  if (cached) return NextResponse.json(cached);

  const tles = await Promise.all(
    NORAD_IDS.map(async (id) => {
      const res = await fetch(
        `https://celestrak.org/NORAD/elements/gp.php?CATNR=${id}&FORMAT=json`
      );
      const data = await res.json();
      return { noradId: id, ...data[0] };
    })
  );

  await kv.set('tle:latest', tles, { ex: CACHE_TTL });
  return NextResponse.json(tles);
}
```

### 3.3 Reference TLE Data (Feb 2026 Epoch)

Hardcoded fallback in case CelesTrak is unreachable:

```
BW3 (53807):
1 53807U 22111AL 26051.69931396  .00006042  00000-0  17568-3 0  9992
2 53807  53.2291 220.2814 0006904 163.5512 196.5718 15.36862718192284

BB3 (61045):
1 61045U 24163A  26059.13578965  .00010066  00000-0  45836-3 0  9990
2 61045  52.9693  91.0403 0007935 162.8389 197.2875 15.21265803 81179

BB5 (61046):
1 61046U 24163B  26059.25115261  .00012287  00000-0  55801-3 0  9990
2 61046  52.9791  90.4021 0011468 151.4989 208.6634 15.21120754 81180

BB1 (61047):
1 61047U 24163C  26059.19347113  .00008537  00000-0  38937-3 0  9992
2 61047  52.9742  90.7212 0007832 163.7445 196.3827 15.21299361 81189

BB2 (61048):
1 61048U 24163D  26059.06010918  .00011429  00000-0  52036-3 0  9995
2 61048  52.9646  91.3994 0009020 160.2531 199.8859 15.21096282 81163

BB4 (61049):
1 61049U 24163E  26059.12471759  .00014285  00000-0  64870-3 0  9990
2 61049  52.9714  91.0766 0009221 159.1254 200.9135 15.21117979 81176

BB6 (67232):
1 67232U 25230A  26058.91253741  .00012500  00000-0  52000-3 0  9990
2 67232  53.0100  85.2000 0008500 155.0000 205.1500 15.22000000  9500
```

---

## 4. AOI Geometry System

### 4.1 Why Polygons, Not Circles

The original prototype used center-point + radius circles for each AOI. This is inaccurate because:

- **Iran** is ~2,000 km east-west, ~1,500 km north-south. An 800 km radius circle from center misses the western and eastern extremities.
- A satellite directly over **Natanz** (western Iran) could be 600 km from the center point — scoring as "approaching" when it's literally overhead a primary nuclear facility.
- **Chile** is 4,300 km long and 177 km wide. A circle is useless.
- Irregularly shaped maritime zones (South China Sea, Red Sea corridor) cannot be represented by circles.

### 4.2 Polygon-Based Coverage Check

The correct approach:

1. Each AOI is defined as a **polygon** of boundary coordinates (simplified country/region borders)
2. The satellite's **footprint** is a circle on Earth's surface, computed from altitude + minimum elevation angle
3. **Coverage = footprint circle overlaps with AOI polygon**
4. A satellite "covers" an AOI if **any point** within the AOI boundary falls inside the satellite's footprint

### 4.3 Satellite Footprint Geometry

At altitude `h` with minimum usable elevation angle `θ_min`:

```
footprint_radius = R_earth × (π/2 − θ_min − arcsin((R/(R+h)) × cos(θ_min)))
```

| Altitude | Min Elevation | Footprint Radius | Use Case |
|----------|--------------|------------------|----------|
| 510 km | 0° (horizon) | ~2,580 km | Theoretical maximum |
| 510 km | 5° | ~2,100 km | Marginal detection |
| 510 km | 10° | ~1,580 km | **Usable comms (default)** |
| 510 km | 20° | ~1,180 km | Good signal quality |
| 510 km | 45° | ~580 km | Excellent, near-overhead |
| 510 km | 70° | ~260 km | Near-zenith pass |

Default threshold: **10° elevation = 1,580 km footprint radius**

### 4.4 Intersection Algorithm

Three-level filtering for performance (checking 7 sats × 55 AOIs at 1 Hz = 385 checks/second):

```
Level 1: BOUNDING BOX REJECTION (instant, no trig)
  → If satellite lat/lng is outside AOI bounding box expanded by footprint radius, reject.
  → Eliminates ~90% of checks.

Level 2: CENTROID + MAX EXTENT (one haversine call)
  → If haversine(sat, aoi.centroid) > footprint + aoi.maxExtent, reject.
  → Eliminates ~8% of remaining checks.

Level 3: FULL POLYGON INTERSECTION (N haversine calls)
  → Compute minimum distance from satellite to any polygon edge/vertex.
  → If satellite is inside polygon, distance = 0 (direct overflight).
  → If minDistance < footprintRadius, satellite covers AOI.
  → Only runs for ~2% of total checks.
```

**Production shortcut with Turf.js:**

```typescript
import { booleanIntersects } from '@turf/boolean-intersects';
import { circle } from '@turf/circle';

function satelliteCoversAOI(satLat: number, satLng: number, satAlt: number, aoiPolygon: GeoJSON.Feature): boolean {
  const fp = footprintRadius(satAlt, 10); // km
  const footprintCircle = circle([satLng, satLat], fp, { units: 'kilometers', steps: 32 });
  return booleanIntersects(footprintCircle, aoiPolygon);
}
```

### 4.5 Hotspot Scoring

Beyond binary "covers / doesn't cover," the system scores **what** is being covered within the polygon:

- Each AOI has **hotspots** — specific high-value locations (nuclear facilities, military bases, command centers)
- When a satellite's footprint covers a hotspot, it gets bonus scoring weight
- A pass directly over Natanz (nuclear enrichment) scores higher than a pass over empty desert in Balochistan

```typescript
interface Hotspot {
  name: string;
  lat: number;
  lng: number;
  type: 'nuclear' | 'military' | 'command' | 'naval' | 'airbase' | 'launch' | 'infrastructure' | 'chokepoint';
  weight: number; // 0.5 - 2.0 multiplier
}
```

### 4.6 Polygon Data Sources

| Source | Resolution | Size | Use Case |
|--------|-----------|------|----------|
| Natural Earth 110m | ~100 km | ~800 KB | Default country borders, fast load |
| Natural Earth 50m | ~50 km | ~5 MB | Higher detail for small countries |
| Hand-drawn overrides | Custom | ~20 KB | Sub-country zones (Taiwan Strait, Korean DMZ, Red Sea corridor) |
| `circleToPolygon()` fallback | 24-point circle | ~1 KB | Quick bootstrap for new AOIs |

**Workflow:**
1. Load `ne_110m_admin_0_countries.json` at build time
2. Filter to countries of interest (ISO A3 codes)
3. Simplify with `turf.simplify(polygon, { tolerance: 0.5 })` if needed
4. Override with hand-drawn polygons for sub-country AOIs
5. Pre-compute centroid, bounding box, maxExtent for each polygon

---

## 5. Global AOI Database — 55 Zones

### 5.1 Coverage Constraint

ASTS constellation inclination: **~52.9-53.2°**
Maximum latitude coverage: **~53° N/S**

| Coverage Quality | Latitude Range | Pass Characteristics |
|-----------------|---------------|---------------------|
| Excellent | \|lat\| < 40° | Near-zenith passes, long windows (8-12 min) |
| Good | \|lat\| 40-50° | Good elevation angles, standard windows |
| Marginal | \|lat\| 50-53° | Low passes, short windows (3-5 min) |
| Poor | \|lat\| > 53° | At edge or outside coverage band |

### 5.2 Tier 1 — Critical (10 AOIs)

Immediate operational relevance. Continuous monitoring.

| # | AOI | Country/Region | Center | Category | Coverage | Context |
|---|-----|---------------|--------|----------|----------|---------|
| 1 | **Iran** | Iran | 32.4°N, 53.7°E | Active Conflict | Excellent | Primary AOI. Two proven correlations with military ops (<1% random probability). Covers all nuclear facilities. |
| 2 | **Iran — Natanz** | Iran | 33.7°N, 51.7°E | Nuclear | Excellent | Primary uranium enrichment. Underground centrifuge halls. Previous Stuxnet target. |
| 3 | **Iran — Fordow** | Iran | 34.9°N, 51.6°E | Nuclear | Excellent | Mountain bunker near Qom. Enriching to 60%. Hardened against aerial strike. |
| 4 | **Iran — Bushehr** | Iran | 28.9°N, 50.8°E | Nuclear | Excellent | Bushehr reactor + Kharg Island oil terminal. Dual strategic value. |
| 5 | **Ukraine (East)** | Ukraine | 48.5°N, 37.8°E | Active Conflict | Good | Active frontline in Donetsk/Luhansk. Bakhmut, Avdiivka, Pokrovsk axes. |
| 6 | **Ukraine (South/Crimea)** | Ukraine/Russia | 45.5°N, 34.0°E | Active Conflict | Good | Crimea, Sevastopol, Kerch Bridge. Maritime drone corridor. |
| 7 | **Taiwan Strait** | Taiwan/China | 24.0°N, 120.5°E | Contested Border | Excellent | Highest-consequence flashpoint. 180km strait. TSMC. PLA exercises. |
| 8 | **Gaza** | Palestine/Israel | 31.4°N, 34.4°E | Active Conflict | Excellent | Active IDF operations since Oct 2023. Tunnel networks. Humanitarian. |
| 9 | **Red Sea / Bab al-Mandab** | Yemen/Djibouti | 15.0°N, 42.0°E | Active Conflict | Excellent | Houthi anti-ship attacks. US/UK strikes. Critical trade chokepoint. |
| 10 | **Sudan** | Sudan | 15.5°N, 30.0°E | Active Conflict | Excellent | RSF vs SAF civil war. World's largest displacement crisis. |

### 5.3 Tier 2 — Strategic (16 AOIs)

Active buildups, nuclear programs, major chokepoints.

| # | AOI | Country/Region | Center | Category | Coverage | Context |
|---|-----|---------------|--------|----------|----------|---------|
| 11 | **North Korea** | DPRK | 40.0°N, 127.0°E | Nuclear | Excellent | Yongbyon, Punggye-ri, ICBM facilities. |
| 12 | **Korean DMZ** | Korea | 38.0°N, 127.0°E | Contested Border | Excellent | Most militarized border. 1M troops. Seoul in artillery range. |
| 13 | **Pakistan Nuclear Belt** | Pakistan | 33.0°N, 72.0°E | Nuclear | Excellent | Kahuta, Khushab, Chashma. Fastest growing arsenal. |
| 14 | **India Nuclear Command** | India | 21.0°N, 79.0°E | Nuclear | Excellent | BARC, missile test range, submarine base. Triad operational. |
| 15 | **Strait of Hormuz** | Iran/Oman/UAE | 26.6°N, 56.3°E | Maritime Chokepoint | Excellent | 21% global oil daily. 33km wide. IRGCN fast attack. |
| 16 | **South China Sea** | Multi-nation | 12.0°N, 114.0°E | Contested Border | Excellent | $5.3T trade/year. Militarized artificial islands. |
| 17 | **Strait of Malacca** | Malaysia/Indonesia | 3.0°N, 101.0°E | Maritime Chokepoint | Excellent | 25% global trade. China's energy lifeline. 2.7km narrows. |
| 18 | **Suez Canal** | Egypt | 30.5°N, 32.4°E | Maritime Chokepoint | Excellent | 12% global trade. Single point of failure. |
| 19 | **Turkish Straits** | Turkey | 41.1°N, 29.1°E | Maritime Chokepoint | Excellent | Black Sea access. Russia navy transit. Montreux Convention. |
| 20 | **GIUK Gap** | Iceland/UK/Norway | 63.0°N, -15.0°E | Maritime Chokepoint | **Poor** ⚠️ | Russian sub transit. NATO ASW. *Outside ASTS coverage band.* |
| 21 | **China — Fujian** | China | 25.5°N, 118.0°E | Military Buildup | Excellent | PLA Eastern Theater. Amphibious staging opposite Taiwan. J-20 bases. |
| 22 | **China — Hainan/Yulin** | China | 18.2°N, 109.5°E | Military Buildup | Excellent | Underground SSBN base. Type 094 subs. SCS gateway. |
| 23 | **Kaliningrad** | Russia | 54.7°N, 20.5°E | Military Buildup | **Marginal** ⚠️ | Russian exclave. Iskander-M. S-400. Suwalki Gap. |
| 24 | **Crimea** | Russia (occupied) | 45.0°N, 34.1°E | Military Buildup | Good | Black Sea Fleet HQ. Kerch Bridge. Ukrainian strikes ongoing. |
| 25 | **Syria** | Syria | 35.0°N, 38.0°E | Active Conflict | Excellent | Post-Assad. Former Russian bases. Iranian proxies. ISIS remnants. |
| 26 | **Iraq** | Iraq | 33.3°N, 44.0°E | Active Conflict | Excellent | Iran-militia strikes on US bases. ISIS remnants. CENTCOM ops. |

### 5.4 Tier 3 — Elevated (16 AOIs)

Significant strategic value. Periodic monitoring.

| # | AOI | Country/Region | Center | Category | Coverage |
|---|-----|---------------|--------|----------|----------|
| 27 | India-China LAC (Ladakh) | India/China | 34.5°N, 78.0°E | Contested Border | Excellent |
| 28 | Senkaku / Diaoyu Islands | Japan/China | 25.8°N, 123.5°E | Contested Border | Excellent |
| 29 | Second Thomas Shoal | Philippines/China | 9.8°N, 115.9°E | Contested Border | Excellent |
| 30 | Myanmar | Myanmar | 20.0°N, 96.0°E | Active Conflict | Excellent |
| 31 | Lebanon-Israel Border | Lebanon/Israel | 33.3°N, 35.5°E | Contested Border | Excellent |
| 32 | Libya | Libya | 31.0°N, 17.0°E | Active Conflict | Excellent |
| 33 | Horn of Africa | Ethiopia/Somalia | 9.0°N, 42.0°E | Active Conflict | Excellent |
| 34 | Sahel (Mali/Niger/Burkina) | West Africa | 15.0°N, 0.0°E | Active Conflict | Excellent |
| 35 | Eastern DRC | DR Congo | -1.5°S, 29.0°E | Active Conflict | Excellent |
| 36 | Xichang Launch Center | China | 28.3°N, 102.0°E | Launch Facility | Excellent |
| 37 | Jiuquan Launch Center | China | 41.0°N, 100.3°E | Launch Facility | Excellent |
| 38 | Sohae / DPRK Launch Site | North Korea | 39.7°N, 124.7°E | Launch Facility | Excellent |
| 39 | Iran Semnan Launch Site | Iran | 35.2°N, 53.9°E | Launch Facility | Excellent |
| 40 | Diego Garcia | UK/US | -7.3°S, 72.4°E | Intelligence Cluster | Excellent |
| 41 | Guam | US | 13.4°N, 144.8°E | Military Buildup | Excellent |
| 42 | Djibouti Base Cluster | Multi-nation | 11.6°N, 43.2°E | Intelligence Cluster | Excellent |

### 5.5 Tier 4 — General Watch (13 AOIs)

Lower immediate risk, strategically significant.

| # | AOI | Country/Region | Center | Category | Coverage |
|---|-----|---------------|--------|----------|----------|
| 43 | Venezuela | Venezuela | 8.0°N, -66.0°W | Emerging Flashpoint | Excellent |
| 44 | Guyana / Essequibo | Guyana/Venezuela | 5.5°N, -59.0°W | Contested Border | Excellent |
| 45 | Arctic / Svalbard | Norway/Russia | 78.0°N, 16.0°E | Emerging Flashpoint | **Poor** ⚠️ |
| 46 | Baltic Sea (Cables) | NATO/Russia | 55.5°N, 18.0°E | Critical Infrastructure | **Marginal** ⚠️ |
| 47 | Kashmir (LoC) | India/Pakistan | 34.0°N, 75.5°E | Contested Border | Excellent |
| 48 | Falkland Islands | UK/Argentina | -51.8°S, -59.0°W | Contested Border | Good |
| 49 | Panama Canal | Panama | 9.1°N, -79.7°W | Maritime Chokepoint | Excellent |
| 50 | Cape of Good Hope | South Africa | -34.4°S, 18.5°E | Maritime Chokepoint | Excellent |
| 51 | Mozambique Channel | Mozambique | -12.5°S, 40.5°E | Active Conflict | Excellent |
| 52 | Russia Pacific (Kamchatka) | Russia | 53.0°N, 158.0°E | Military Buildup | **Marginal** ⚠️ |
| 53 | Cuba | Cuba | 22.0°N, -79.5°W | Intelligence Cluster | Excellent |
| 54 | Solomon Islands | Solomon Islands | -9.4°S, 160.0°E | Emerging Flashpoint | Excellent |
| 55 | Cambodia Ream Naval Base | Cambodia | 10.5°N, 103.6°E | Military Buildup | Excellent |

### 5.6 Database Statistics

```
Total AOIs:              55
  Tier 1 (Critical):     10
  Tier 2 (Strategic):    16
  Tier 3 (Elevated):     16
  Tier 4 (Watch):        13

By category:
  active_conflict:        12
  nuclear:                 5
  maritime_chokepoint:     7
  contested_border:        8
  military_buildup:        7
  launch_facility:         4
  intelligence_cluster:    4
  emerging_flashpoint:     4
  critical_infrastructure: 1

Coverage quality:
  excellent (|lat| < 40°):   44  (80%)
  good (40-50°):              5  ( 9%)
  marginal (50-53°):          3  ( 5%)
  poor (> 53°):               3  ( 5%)  ← GIUK Gap, Arctic, Greenland

Regions:
  Middle East:   12    East Asia:      8    Africa:          8
  South Asia:     4    Southeast Asia: 4    Europe:          5
  Indo-Pacific:   4    South America:  3    Caribbean:       1
  Pacific:        2    Indian Ocean:   1    Arctic:          2
  North Atlantic: 1
```

---

## 6. Orbital Propagation Engine

### 6.1 satellite.js Integration

```typescript
// lib/orbital/propagator.ts
import {
  twoline2satrec, propagate, gstime, eciToGeodetic,
  degreesLat, degreesLong,
} from 'satellite.js';

export interface SatPosition {
  satId: string;
  lat: number;          // degrees
  lng: number;          // degrees
  alt: number;          // km above WGS84
  velocity: number;     // km/s
  timestamp: Date;
}

export interface SatRecord {
  id: string;
  norad: number;
  name: string;
  codename: string;
  color: string;
  type: 'prototype' | 'block1' | 'block2';
  satrec: ReturnType<typeof twoline2satrec>;
}

export function getPosition(
  satrec: ReturnType<typeof twoline2satrec>,
  date: Date
): SatPosition | null {
  const result = propagate(satrec, date);
  if (!result?.position || typeof result.position === 'boolean') return null;

  const gmst = gstime(date);
  const geo = eciToGeodetic(result.position, gmst);

  return {
    satId: String(satrec.satnum),
    lat: geo.latitude * (180 / Math.PI),
    lng: geo.longitude * (180 / Math.PI),
    alt: geo.height,
    velocity: Math.sqrt(
      result.velocity.x ** 2 + result.velocity.y ** 2 + result.velocity.z ** 2
    ),
    timestamp: date,
  };
}

export function getGroundTrack(
  satrec: ReturnType<typeof twoline2satrec>,
  startDate: Date,
  durationMinutes: number,
  stepMinutes: number = 1
): SatPosition[] {
  const positions: SatPosition[] = [];
  for (let m = 0; m <= durationMinutes; m += stepMinutes) {
    const date = new Date(startDate.getTime() + m * 60000);
    const pos = getPosition(satrec, date);
    if (pos) positions.push(pos);
  }
  return positions;
}
```

### 6.2 Access Window Calculator

```typescript
// lib/orbital/access-window.ts
export interface AccessWindow {
  satId: string;
  aoiId: string;
  startTime: Date;
  endTime: Date;
  peakTime: Date;
  peakElevation: number;    // degrees at closest approach
  durationMinutes: number;
  hotspotsInFootprint: string[];  // names of hotspots covered during window
}

export function findAccessWindows(
  sat: SatRecord,
  aoi: AOIPolygon,
  startDate: Date,
  durationHours: number,
  stepMinutes: number = 1,
  minElevation: number = 10
): AccessWindow[] {
  // Step through time, check polygon intersection at each step
  // Group contiguous "covers" steps into windows
  // Track which hotspots are in footprint during each window
  // [Implementation uses satelliteCoversAOI() from coverage-check.ts]
}
```

---

## 7. Waffle Level Scoring Algorithm

### 7.1 Scoring Weights

```typescript
const TYPE_WEIGHTS = {
  prototype: 3.5,  // BW3 — proven operational correlation
  block2: 2.5,     // BB6+ — 2,400 sq ft array (3.5x Block 1)
  block1: 1.5,     // BB1-5 — standard operational constellation
};
```

### 7.2 Elevation Multiplier

Higher elevation = better coverage quality. Directly overhead is best.

```
elev >= 70°  →  1.00  (near-zenith)
elev >= 45°  →  0.85  (good pass)
elev >= 25°  →  0.60  (moderate pass)
elev >= 10°  →  0.35  (marginal pass)
elev < 10°   →  0.00  (below usable horizon)
```

### 7.3 Hotspot Bonus

When a satellite's footprint specifically covers a named hotspot:

```
nuclear facility:     +0.5 weight bonus
military/command:     +0.3 weight bonus
infrastructure:       +0.2 weight bonus
other:                +0.1 weight bonus
```

### 7.4 Composite Score

```
Raw Score = Σ(in-footprint sats: TYPE_WEIGHT × ELEVATION_MULT × (1 + HOTSPOT_BONUS))
          + Σ(approaching sats:  TYPE_WEIGHT × ELEVATION_MULT × 0.3)

Waffle Level = min(10.0, Raw Score)
```

### 7.5 Level Thresholds

| Level | Label | Color | Typical Scenario |
|-------|-------|-------|-----------------|
| 0-3.9 | BASELINE | `#00FF88` | 0-1 Block 1 sats with low elevation |
| 4-5.9 | MODERATE | `#FFB800` | 2 sats in footprint or 1 high-value pass |
| 6-7.9 | ELEVATED | `#FF6B00` | 3+ sats or BW3 + Block 1 pair at high elevation |
| 8-10 | CRITICAL | `#FF0040` | BW3 + multiple Block 1 + hotspot coverage. Historic ops aligned at 7-9. |

---

## 8. Forward Prediction Engine

### 8.1 How It Works

Propagate all 7 satellites forward at 5-minute steps for 30-90 days. At each timestep, check which AOI polygons the satellite footprints intersect. When 2+ satellites score above threshold over the same AOI within a rolling window, flag as a predicted alignment event.

### 8.2 Confidence Scoring

TLE accuracy degrades over time. For footprint-level analysis (~100 km precision), predictions remain useful for weeks.

| TLE Age | Position Error | Confidence | Timing Accuracy |
|---------|---------------|------------|-----------------|
| 0-3 days | ~1-5 km | HIGH | ± few minutes |
| 3-7 days | ~5-20 km | MEDIUM | ± 10-15 minutes |
| 7-30 days | ~20-100+ km | LOW | ± 30-60 minutes |
| >30 days | unreliable | — | Don't display |

### 8.3 Pattern Detection

The system should identify repeating cycles. Known cycle from February 2025 analysis:

- BW3/BB1 tag-team formation over Iran: **~13-14 day cycle**
- Caused by differential RAAN precession between BW3 (different orbit) and Block 1 constellation
- Forward predictions should flag when this pattern is expected to repeat

```typescript
export interface PredictedAlignment {
  windowStart: Date;
  windowEnd: Date;
  peakTime: Date;
  aoiId: string;
  predictedWaffleLevel: number;
  satsInvolved: string[];
  confidence: 'high' | 'medium' | 'low';
  tleAge: number;               // hours since TLE epoch
  matchesKnownCycle: boolean;   // matches a previously observed pattern
  cycleId?: string;             // e.g., "BW3-BB1-iran-13d"
}
```

### 8.4 Cron Schedule

Predictions regenerated every 4 hours (when new TLEs arrive), offset by 30 minutes from TLE fetch:

```
TLE fetch:       0:00, 4:00, 8:00, 12:00, 16:00, 20:00 UTC
Alignment scan:  every 15 minutes
Prediction regen: 0:30, 4:30, 8:30, 12:30, 16:30, 20:30 UTC
```

---

## 9. Database Schema

```sql
-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- TLE history
CREATE TABLE tle_history (
  id              BIGSERIAL PRIMARY KEY,
  norad_id        INTEGER NOT NULL,
  satellite_name  TEXT NOT NULL,
  tle_line1       TEXT NOT NULL,
  tle_line2       TEXT NOT NULL,
  epoch           TIMESTAMPTZ NOT NULL,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL DEFAULT 'celestrak',
  UNIQUE(norad_id, epoch)
);
CREATE INDEX idx_tle_norad_epoch ON tle_history(norad_id, epoch DESC);

-- AOI definitions (polygon stored as PostGIS geometry)
CREATE TABLE aoi_definitions (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  priority        INTEGER NOT NULL,
  category        TEXT NOT NULL,
  color           TEXT NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  tags            TEXT[],
  context         TEXT,
  boundary        GEOMETRY(POLYGON, 4326) NOT NULL,
  centroid        GEOMETRY(POINT, 4326),
  coverage_quality TEXT NOT NULL
);
CREATE INDEX idx_aoi_geom ON aoi_definitions USING GIST(boundary);

-- AOI hotspots
CREATE TABLE aoi_hotspots (
  id              BIGSERIAL PRIMARY KEY,
  aoi_id          TEXT REFERENCES aoi_definitions(id),
  name            TEXT NOT NULL,
  location        GEOMETRY(POINT, 4326) NOT NULL,
  type            TEXT NOT NULL,
  weight_bonus    DECIMAL(3,2) NOT NULL DEFAULT 0.1
);
CREATE INDEX idx_hotspot_geom ON aoi_hotspots USING GIST(location);

-- Alignment events (historical + detected)
CREATE TABLE alignment_events (
  id                    BIGSERIAL PRIMARY KEY,
  aoi_id                TEXT NOT NULL REFERENCES aoi_definitions(id),
  event_start           TIMESTAMPTZ NOT NULL,
  event_end             TIMESTAMPTZ,
  peak_time             TIMESTAMPTZ NOT NULL,
  waffle_level          DECIMAL(3,1) NOT NULL,
  sats_in_footprint     TEXT[] NOT NULL,
  sats_approaching      TEXT[],
  hotspots_covered      TEXT[],
  coverage_minutes      INTEGER,
  simultaneous_peak     INTEGER,
  detected_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_prediction         BOOLEAN NOT NULL DEFAULT FALSE,
  confidence            TEXT,
  matches_cycle         BOOLEAN DEFAULT FALSE,
  cycle_id              TEXT,
  correlated_event      TEXT,
  notes                 TEXT
);
CREATE INDEX idx_align_aoi_time ON alignment_events(aoi_id, peak_time DESC);
CREATE INDEX idx_align_level ON alignment_events(waffle_level DESC);
CREATE INDEX idx_align_prediction ON alignment_events(is_prediction, aoi_id, peak_time);

-- Alert subscriptions
CREATE TABLE alert_subscriptions (
  id              BIGSERIAL PRIMARY KEY,
  channel         TEXT NOT NULL,      -- 'discord', 'telegram', 'webhook'
  endpoint        TEXT NOT NULL,
  aoi_ids         TEXT[],             -- NULL = all AOIs
  min_level       DECIMAL(3,1) NOT NULL DEFAULT 6.0,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert dispatch log
CREATE TABLE alert_log (
  id              BIGSERIAL PRIMARY KEY,
  subscription_id BIGINT REFERENCES alert_subscriptions(id),
  alignment_id    BIGINT REFERENCES alignment_events(id),
  dispatched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL,       -- 'sent', 'failed', 'throttled'
  response        JSONB
);

-- OSINT correlations (manually curated)
CREATE TABLE osint_events (
  id              BIGSERIAL PRIMARY KEY,
  event_date      TIMESTAMPTZ NOT NULL,
  event_name      TEXT NOT NULL,
  description     TEXT,
  aoi_id          TEXT REFERENCES aoi_definitions(id),
  sources         TEXT[],
  alignment_id    BIGINT REFERENCES alignment_events(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 10. API Endpoints

| Method | Path | Description | Cache |
|--------|------|-------------|-------|
| GET | `/api/tle` | Latest TLEs for all ASTS sats | 4h (KV) |
| GET | `/api/tle/history?norad={id}&days=30` | TLE epoch history | 1h |
| GET | `/api/positions` | Current positions all sats | 10s |
| GET | `/api/alignment?aoi={id}` | Current Waffle Level for an AOI | 30s |
| GET | `/api/alignment/all` | Current levels for all AOIs | 30s |
| GET | `/api/alignment/history?aoi={id}&days=30` | Historical alignment events | 5m |
| GET | `/api/predict?aoi={id}&days=30` | Predicted future alignments | 1h |
| GET | `/api/predict/all?days=14` | All predicted events, all AOIs | 1h |
| GET | `/api/access-windows?sat={id}&aoi={id}&hours=24` | Sat/AOI access windows | 15m |
| GET | `/api/hotspots?aoi={id}` | Hotspots currently in any sat footprint | 30s |
| GET | `/api/aois` | All AOI definitions with polygon GeoJSON | 24h |
| POST | `/api/alerts/subscribe` | Subscribe to alignment alerts | — |
| POST | `/api/cron/fetch-tle` | Cron: fetch fresh TLEs | — |
| POST | `/api/cron/scan-alignment` | Cron: scan current alignments | — |
| POST | `/api/cron/regenerate-predictions` | Cron: refresh predictions | — |

---

## 11. Frontend Design System

### 11.1 Visual Identity

**Aesthetic:** Bloomberg Terminal × WSB meme culture. Dark, monospace, data-dense, with strategic color and animation for alert states.

```typescript
// tailwind.config.ts theme
{
  colors: {
    bg:      '#050505',
    panel:   '#0a0a0a',
    card:    '#0d0d0d',
    border:  '#1a1a1a',
    waffle:  '#FFB800',    // Primary brand — waffle gold
    danger:  '#FF0040',    // Critical alignment
    warn:    '#FF6B00',    // Elevated alignment
    ok:      '#00FF88',    // Baseline / nominal
    blue:    '#4488FF',    // Secondary data
    bb1:     '#FF6B35',    // Block 1 satellite color
    block2:  '#00FF88',    // Block 2 color
  },
  fontFamily: {
    mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
  },
}
```

**Typography:** All JetBrains Mono. Labels 8-9px uppercase dim gray. Values 18-42px bold colored by state. Body 10-11px #aaa. Never serif.

**Animations:**
- Ticker: 80s linear infinite scroll
- CRITICAL blink: 1s ease-in-out on label only
- AOI pulse: 2s ring expansion on selected AOI
- Satellite trails: opacity fade over 60 points
- Map: 1 FPS trail updates, 10 FPS satellite positions

### 11.2 Tracker Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🧇 WAFL: 9.2 ▲ ● BW3 overhead IRAN ● RIP Pizza ● ...  │  ← Ticker
├─────────────────────────────────────────────────────────┤
│ 🧇 WAFFLE INDICATOR                 UTC 18:42:15  [■]  │  ← Header
│    $ASTS v2.0 — REAL SGP4           T+ 00:14:32        │
├────────┬───────┬────────┬───────┬───────────────────────┤
│ 🛰 TRK │ 📊 IN │ 📡 DAT │ 🔮 PRED │                    │  ← Tabs
├────────┴───────┴────────┴───────┴───────────────────────┤
│ [SATS:3] [COV:~45m] [CYCLE:13d] [P:<1%] [LVL:9.2]     │  ← Stats
├────────────────────────────────────┬────────────────────┤
│   [AOI TIER: 1▼] [REGION: ALL▼]   │ WAFFLE ALIGNMENT   │
│  ┌──────────────────────────────┐  │ INDEX              │
│  │                              │  │  ████████░░  9.2   │
│  │   EQUIRECTANGULAR MAP        │  │  CRITICAL          │
│  │   Country polygons rendered  │  ├────────────────────┤
│  │   Satellite footprint circles│  │ HOTSPOTS IN VIEW   │
│  │   Ground tracks with trails  │  │ ⚛ Natanz  12.4°el │
│  │   Hotspot markers            │  │ ⚛ Fordow  28.1°el │
│  │   LOS lines to hotspots     │  │ ⚛ Isfahan 18.7°el │
│  │                              │  ├────────────────────┤
│  └──────────────────────────────┘  │ RECENT EVENTS      │
│  ┌──────────────────────────────┐  │ ┃ 02-28 LVL 9     │
│  │ SAT  CODE      LAT   LNG  ↗ │  │ ┃ 🎯 Midnight Ham │
│  │ BW3  OG WAFFLE 32.1° 54.2°  │  │ ┃ 02-14 LVL 7     │
│  │ BB1  BLUEBIRD  -12°  88.1°  │  │ ┃ 🎯 Absolute Res │
│  └──────────────────────────────┘  │                    │
├────────────────────────────────────┴────────────────────┤
│ 🧇 NOT FINANCIAL ADVICE    $ASTS 🛰 TLE: CELESTRAK.ORG  │  ← Footer
└─────────────────────────────────────────────────────────┘
```

### 11.3 Predictions Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ PREDICTED ALIGNMENT WINDOWS — NEXT 30 DAYS              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GANTT TIMELINE (horizontal scroll)                     │
│  Mar 1 ────── Mar 8 ────── Mar 15 ────── Mar 22 ──     │
│  IRAN  ░░░██░░░░░░░░░░████░░░░░░░░░██░░░░░░░░░░░░     │
│  TAIWN  ░░░░░░░██░░░░░░░░░░░░██░░░░░░░░░██░░░░░░░     │
│  UKR    ░██░░░░░░░░██░░░░░░░░░░░██░░░░░░░░░░░░██░     │
│  SCS    ░░░░██░░░░░░░░░░░██░░░░░░░░░░░██░░░░░░░░░     │
│  DPRK   ░░░░░░░░██░░░░░░░░░░░██░░░░░░░░░░░░██░░░     │
│                                                         │
│  ██ = Level > 6 (ELEVATED+)  ░ = Level 4-6 (MODERATE)  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ UPCOMING WINDOWS                                        │
│                                                         │
│  ┌─ Mar 13 ~14:20 UTC ─── IRAN ─── LVL 7.2 ────────┐  │
│  │ CONFIDENCE: HIGH (TLE age <72h)                   │  │
│  │ SATS: BW3 → BB4 → BB5 (tag-team formation)       │  │
│  │ COVERAGE: ~40 min rolling LOS                     │  │
│  │ HOTSPOTS: Natanz ✓  Fordow ✓  Isfahan ✓           │  │
│  │ PATTERN: Matches Feb 1→14→28 cycle (13-14d)       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 11.4 Map Rendering — Polygon AOIs

The canvas map now renders:

1. **Country polygons** — filled dark gray (#141414) with borders (#2a2a2a) for continental outlines
2. **AOI polygons** — filled semi-transparent color (matching AOI color at 15% opacity), solid border at full color
3. **Satellite footprint circles** — dashed circle showing the 1,580 km coverage radius for each satellite
4. **Footprint-polygon intersection** — highlighted area where footprint overlaps AOI (bright fill at 25% opacity)
5. **Hotspot markers** — small diamonds within AOI polygons, colored by type (red=nuclear, blue=military, etc.)
6. **LOS lines** — thin lines from satellite to hotspots currently in footprint
7. **Ground tracks** — trailing path showing satellite history (60 points, fading opacity)

---

## 12. Real-Time Update Strategy

| Data | Method | Frequency | Source |
|------|--------|-----------|--------|
| Satellite positions | Client-side SGP4 | 1 Hz (map), 10 Hz (canvas) | satellite.js |
| Polygon coverage checks | Client-side Turf.js | 1 Hz | Derived from positions |
| Waffle Level | Derived from coverage | 1 Hz | Client computation |
| Hotspot-in-footprint | Derived from positions | 1 Hz | Client computation |
| TLE data | Vercel Cron → KV → client | Every 4 hours | CelesTrak |
| Alignment events | Vercel Cron scan | Every 15 minutes | Server computation |
| Predictions | Server-side, cached | Every 4 hours | Server computation |
| OSINT correlations | Manual curation | As events occur | Human input |

### 12.1 Client-Side Loop

```typescript
// hooks/useOrbitalPropagation.ts
export function useOrbitalPropagation(satellites: SatRecord[], intervalMs = 1000) {
  const [positions, setPositions] = useState<SatPosition[]>([]);

  useEffect(() => {
    let lastUpdate = 0;
    const loop = (timestamp: number) => {
      if (timestamp - lastUpdate >= intervalMs) {
        const now = new Date();
        const newPositions = satellites
          .map(sat => getPosition(sat.satrec, now))
          .filter(Boolean) as SatPosition[];
        setPositions(newPositions);
        lastUpdate = timestamp;
      }
      requestAnimationFrame(loop);
    };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [satellites, intervalMs]);

  return positions;
}
```

### 12.2 Polygon Coverage Hook

```typescript
// hooks/usePolygonCoverage.ts
export function usePolygonCoverage(
  positions: SatPosition[],
  aois: AOIPolygon[],
  selectedAOI: string | null
) {
  return useMemo(() => {
    return aois.map(aoi => {
      const coverage = positions.map(pos => satelliteCoversAOI(
        pos.lat, pos.lng, pos.alt, aoi
      ));
      const inFootprint = coverage.filter(c => c.covers);
      // Compute waffle level using coverage results
      // Check which hotspots are in any satellite's footprint
      return { aoiId: aoi.id, coverage, inFootprint, waffleLevel: ... };
    });
  }, [positions, aois]);
}
```

---

## 13. Alert System

### 13.1 Discord Webhook

```typescript
export async function sendDiscordAlert(
  webhookUrl: string,
  event: AlignmentEvent,
  aoi: AOIPolygon
): Promise<boolean> {
  const emoji = event.waffle_level >= 8 ? '🔴' : event.waffle_level >= 6 ? '🟠' : '🟡';
  const embed = {
    title: `${emoji} WAFFLE ALERT — ${aoi.name}`,
    description: `Level **${event.waffle_level.toFixed(1)}** over ${aoi.displayName}`,
    color: parseInt(aoi.color.replace('#', ''), 16),
    fields: [
      { name: 'Level', value: event.waffle_level.toFixed(1), inline: true },
      { name: 'Sats', value: event.sats_in_footprint.join(', '), inline: true },
      { name: 'Coverage', value: `~${event.coverage_minutes} min`, inline: true },
      { name: 'Hotspots', value: event.hotspots_covered?.join(', ') || 'None', inline: false },
      { name: 'Peak', value: event.peak_time.toISOString(), inline: false },
    ],
    footer: { text: '🧇 Waffle Indicator — $ASTS — Not Financial Advice' },
    timestamp: new Date().toISOString(),
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
  return res.ok;
}
```

### 13.2 Throttling Rules

- Max 1 alert per AOI per 30 minutes
- Escalation: if level increases by >2 points during active window, send update
- De-escalation: send CLEAR when level drops below threshold after CRITICAL
- Daily digest: summary of all alignment events at 00:00 UTC

---

## 14. Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| First Contentful Paint | <1.5s | SSR initial state, hydrate with client propagation |
| Time to Interactive | <3s | satellite.js ~150KB gzip, Turf.js ~80KB gzip |
| Map frame rate | 30 FPS | Canvas rendering, throttle trails to 1 FPS |
| Polygon check latency | <5ms | 7 sats × 55 AOIs with 3-level filtering |
| Position update latency | <50ms | satellite.js propagation O(1) per sat per timestep |
| API response (cached) | <100ms | Vercel KV |
| API response (computed) | <2s | Bulk propagation 7 sats × 24h × 1-min steps |
| Prediction scan (30 days) | <30s | Server-side, cached in Supabase |
| TLE freshness | <4 hours | Cron-driven updates |
| Bundle size | <600KB gzip | Code-split satellite.js + Turf.js, lazy-load CesiumJS |
| Lighthouse score | >90 | Optimize fonts, defer non-critical JS |

---

## 15. SEO & Social Sharing

```tsx
export const metadata = {
  title: '🧇 Waffle Indicator — $ASTS Satellite Alignment Tracker',
  description: 'Track AST SpaceMobile satellite constellation alignment over 55 global AOIs in real-time. SGP4 propagation. Polygon-accurate coverage. The Pizza Index is dead.',
  openGraph: {
    title: '🧇 WAFFLE INDICATOR',
    description: 'LEO geometry is deterministic. Pizza is lagging. Waffles are leading. 55 AOIs. Real SGP4. Polygon coverage.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🧇 WAFFLE INDICATOR — $ASTS',
    description: 'Track satellite waffles aligning over Iran, Taiwan, Ukraine + 52 more hotspots.',
    images: ['/og-image.png'],
  },
};
```

### Embeddable Widget

```html
<iframe src="https://waffleindicator.com/embed?aoi=iran" width="300" height="200" frameborder="0"></iframe>
```

---

## 16. Deployment Checklist

### Phase 1: MVP (Week 1-2)
- [ ] Next.js scaffold + TypeScript strict mode
- [ ] satellite.js integration + TLE parsing
- [ ] Client-side SGP4 propagation at 1 Hz
- [ ] Canvas equirectangular map with polygon AOI rendering
- [ ] Polygon coverage checks (Turf.js)
- [ ] Waffle Level gauge with real-time scoring
- [ ] Satellite table with per-AOI polygon distance
- [ ] AOI selector with tier/region filtering (all 55 AOIs loaded)
- [ ] Hotspot markers on map + hotspot panel
- [ ] Hardcoded TLEs (fallback)
- [ ] Ticker with meme content
- [ ] Intel tab with thesis + statistical evidence
- [ ] Deploy to Vercel

### Phase 2: Live Data (Week 3-4)
- [ ] CelesTrak TLE proxy API route
- [ ] Vercel KV caching
- [ ] Vercel Cron for TLE updates (every 4h)
- [ ] Supabase + PostGIS schema deployment
- [ ] Natural Earth GeoJSON loading for pixel-perfect borders
- [ ] TLE history storage
- [ ] Alignment event detection + storage
- [ ] Historical alignment timeline view
- [ ] Data sources tab with live TLE metadata

### Phase 3: Predictions (Week 5-6)
- [ ] Forward prediction engine (server-side)
- [ ] Prediction API with caching
- [ ] Predictions tab — Gantt timeline + event cards
- [ ] Confidence scoring (TLE age)
- [ ] Cycle detection (13-14d BW3/BB1 pattern)
- [ ] Prediction regeneration cron (every 4h)

### Phase 4: Alerts & Social (Week 7-8)
- [ ] Discord webhook integration
- [ ] Telegram bot integration
- [ ] Alert subscription API
- [ ] Throttling logic
- [ ] Embeddable widget (`/embed`)
- [ ] Dynamic OG image generation
- [ ] Twitter/X bot auto-posting on Level > 7

### Phase 5: Premium Features (Ongoing)
- [ ] 3D globe (CesiumJS or Three.js)
- [ ] OSINT correlation database
- [ ] ADS-B Exchange overlay
- [ ] NOTAM monitoring
- [ ] Custom AOI creation (user-defined polygons)
- [ ] Historical replay scrubber
- [ ] Mobile-responsive optimization
- [ ] New satellite auto-detection
- [ ] API key system for programmatic access
- [ ] Per-AOI deep-dive pages (`/aoi/[id]`)

---

## 17. Environment Variables

```env
# Data Sources
CELESTRAK_BASE_URL=https://celestrak.org/NORAD/elements/gp.php
SPACETRACK_USERNAME=
SPACETRACK_PASSWORD=

# Database (Supabase + PostGIS)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cache (Vercel KV)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Alerts
DISCORD_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Security
CRON_SECRET=
API_SECRET_KEY=

# Feature Flags
ENABLE_PREDICTIONS=true
ENABLE_ALERTS=true
ENABLE_3D_GLOBE=false
ENABLE_HOTSPOT_SCORING=true
```

---

## 18. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CelesTrak downtime | No TLE updates | Fallback to Space-Track; hardcoded recent TLEs; cache last-known |
| TLE age > 7 days | Position accuracy degrades | Display TLE age; degrade prediction confidence; alert operator |
| New ASTS launches | Missing from tracker | Monitor launch manifest; CelesTrak new-launches feed |
| Satellite maneuvers | TLE stale post-maneuver | Detect position discontinuity; fetch fresh TLE; flag predictions |
| Turf.js bundle size | +80KB to client | Dynamic import; only load on tracker page; simplify polygons at build time |
| Natural Earth GeoJSON size | ~800KB (110m) | Subset to 55 countries at build time; compress; cache in KV |
| Polygon check perf at scale | Slow with 100+ AOIs | 3-level filtering; pre-compute bounding boxes; use Web Workers |
| Vercel cold starts | Slow first API call | Edge runtime; pre-warm with cron |
| OSINT correlation mistakes | Credibility damage | All correlations manually curated with sources; never auto-correlate |
| Legal/ITAR | None | TLEs are unclassified public data; computation is basic physics |
| Coverage gaps (>53° lat) | 3 AOIs with poor coverage | Display coverage quality prominently; warn users; don't predict for poor AOIs |

---

## 19. Key Constants & Formulas

```
EARTH PARAMETERS
  Radius (WGS84):         6,378.137 km
  GM (gravitational):     398,600.4418 km³/s²
  J2 (oblateness):        1.08263 × 10⁻³
  Rotation rate:          7.2921159 × 10⁻⁵ rad/s

ASTS CONSTELLATION
  Altitude:               ~500-520 km
  Orbital period:         ~94.6 minutes
  Ground track shift:     ~22.5° westward per orbit
  Revolutions/day:        ~15.2
  Inclination:            ~52.9-53.2°
  Max latitude coverage:  ~53° N/S

FOOTPRINT GEOMETRY (510 km altitude)
  0° elevation:           ~2,580 km radius (theoretical max)
  5° elevation:           ~2,100 km radius
  10° elevation:          ~1,580 km radius  ← DEFAULT THRESHOLD
  20° elevation:          ~1,180 km radius
  45° elevation:          ~580 km radius
  70° elevation:          ~260 km radius

SCORING WEIGHTS
  BW3 (prototype):        3.5
  Block 2 (BB6+):         2.5
  Block 1 (BB1-5):        1.5

KNOWN CYCLES
  BW3/BB1 Iran tag-team:  ~13-14 day repeat
  Cause: Differential RAAN precession (BW3 vs Block 1 constellation)
  Observed: Feb 1, 14-15, 28, 2025

PROVEN CORRELATIONS
  Feb 14-15, 2025:  Level 7, BW3+BB1+BB4+BB5 → Op. Absolute Resolve
  Feb 28, 2025:     Level 9, BW3+BB1+BB4+BB5 → Op. Midnight Hammer
  P(random) for both: < 1%
```

---

*The Pizza Indicator is dead. Long live the Waffle. 🧇*

---

**Files in this spec package:**
1. `WAFFLE-INDICATOR-SPEC-v2.md` — This document
2. `aoi-database.ts` — Full 55-AOI metadata with categories, tags, context
3. `aoi-polygons.ts` — Polygon boundaries, coverage engine, hotspot definitions
