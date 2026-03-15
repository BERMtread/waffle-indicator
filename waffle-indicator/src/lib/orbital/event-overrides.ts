// =============================================================================
// Event-time satellite position overrides
// =============================================================================
// The hardcoded TLEs have Feb-Mar 2026 epochs. SGP4 propagation degrades when
// rewinding to historical events months away. These overrides place satellites
// in narrative-accurate positions near each event's AOI at the event time.
// =============================================================================

import { CORRELATION_EVENTS } from '../events';
import type { SatPosition } from './propagator';
import { SATELLITES, type SatelliteMeta } from './constants';

interface PositionOverride {
  lat: number;
  lng: number;
  alt: number;
}

// Override window: ±5 minutes from event time
const OVERRIDE_WINDOW_MS = 5 * 60 * 1000;
// Blend window: positions blend from SGP4 to override within this range
const BLEND_WINDOW_MS = 30 * 60 * 1000;

// Satellite positions keyed by event id → satellite id → position
const EVENT_POSITIONS: Record<string, Record<string, PositionOverride>> = {
  // -------------------------------------------------------------------------
  // Op. Sindoor — India Strikes Pakistan (May 6, 2025)
  // AOI: pakistan-nuclear, centroid 33.0°N, 72.0°E
  // -------------------------------------------------------------------------
  sindoor: {
    bw3: { lat: 33.5, lng: 72.5, alt: 508 },
    bb1: { lat: 35.0, lng: 68.5, alt: 512 },
    bb2: { lat: 31.0, lng: 74.5, alt: 510 },
    bb3: { lat: 36.0, lng: 73.0, alt: 509 },
    bb4: { lat: 33.0, lng: 71.0, alt: 511 },
    bb5: { lat: 30.0, lng: 70.0, alt: 510 },
  },

  // -------------------------------------------------------------------------
  // Op. Rising Lion — Israel Strikes Iran (June 12, 2025)
  // AOI: iran, centroid 32.43°N, 53.69°E
  // -------------------------------------------------------------------------
  'rising-lion': {
    bw3: { lat: 33.7, lng: 51.7, alt: 510 },  // over Natanz
    bb1: { lat: 35.0, lng: 49.0, alt: 512 },   // approaching from west
    bb2: { lat: 30.0, lng: 55.5, alt: 509 },   // southeast
    bb3: { lat: 35.5, lng: 51.6, alt: 511 },   // over Fordow
    bb4: { lat: 29.5, lng: 51.0, alt: 510 },   // over Bushehr area
    bb5: { lat: 34.5, lng: 54.0, alt: 508 },   // central Iran
  },

  // -------------------------------------------------------------------------
  // Scarborough Shoal Collision — SCS (Aug 11, 2025)
  // AOI: south-china-sea, centroid 12.0°N, 114.0°E
  // -------------------------------------------------------------------------
  scarborough: {
    bw3: { lat: 14.0, lng: 110.5, alt: 512 },
    bb1: { lat: 10.0, lng: 117.0, alt: 510 },
    bb2: { lat: 12.5, lng: 114.5, alt: 509 },  // over Scarborough
    bb3: { lat: 14.0, lng: 115.0, alt: 511 },
    bb4: { lat: 11.0, lng: 113.0, alt: 510 },
    bb5: { lat: 13.0, lng: 118.0, alt: 508 },
  },

  // -------------------------------------------------------------------------
  // RSF Captures El Fasher — Sudan (Oct 26, 2025)
  // AOI: sudan, centroid 15.5°N, 30.0°E
  // -------------------------------------------------------------------------
  'el-fasher': {
    bw3: { lat: 17.0, lng: 27.5, alt: 510 },
    bb1: { lat: 13.5, lng: 32.0, alt: 512 },
    bb2: { lat: 16.0, lng: 33.0, alt: 509 },
    bb3: { lat: 15.5, lng: 30.0, alt: 511 },   // directly over El Fasher
    bb4: { lat: 14.0, lng: 29.0, alt: 510 },
    bb5: { lat: 18.0, lng: 31.0, alt: 508 },
  },

  // -------------------------------------------------------------------------
  // PLA Justice Mission 2025 — Taiwan Blockade (Dec 28, 2025)
  // AOI: taiwan-strait, centroid 24.0°N, 120.5°E
  // -------------------------------------------------------------------------
  'taiwan-blockade': {
    bw3: { lat: 26.0, lng: 118.0, alt: 510 },
    bb1: { lat: 24.5, lng: 120.5, alt: 512 },  // over strait
    bb2: { lat: 22.0, lng: 122.0, alt: 509 },
    bb3: { lat: 25.0, lng: 121.0, alt: 511 },  // over strait
    bb4: { lat: 23.0, lng: 118.5, alt: 510 },
    bb5: { lat: 26.5, lng: 122.5, alt: 508 },
    bb6: { lat: 24.0, lng: 119.5, alt: 511 },  // over strait
  },

  // -------------------------------------------------------------------------
  // Op. Absolute Resolve — US Captures Maduro (Jan 3, 2026)
  // AOI: venezuela, centroid 8.0°N, 66.0°W
  // -------------------------------------------------------------------------
  venezuela: {
    bw3: { lat: 10.0, lng: -63.0, alt: 510 },
    bb1: { lat: 8.5, lng: -66.0, alt: 512 },   // directly over
    bb2: { lat: 6.0, lng: -68.0, alt: 509 },
    bb3: { lat: 9.0, lng: -65.0, alt: 511 },
    bb4: { lat: 7.0, lng: -63.5, alt: 510 },
    bb5: { lat: 11.0, lng: -69.0, alt: 508 },
    bb6: { lat: 8.0, lng: -66.5, alt: 511 },
  },

  // -------------------------------------------------------------------------
  // DPRK Ballistic Missile Salvo (Jan 3, 2026)
  // AOI: north-korea, centroid 40.0°N, 127.0°E
  // -------------------------------------------------------------------------
  'dprk-salvo': {
    bw3: { lat: 40.0, lng: 127.0, alt: 510 },  // directly over
    bb1: { lat: 39.0, lng: 125.5, alt: 512 },   // over Pyongyang
    bb2: { lat: 41.5, lng: 130.0, alt: 509 },
    bb3: { lat: 38.5, lng: 128.0, alt: 511 },
    bb4: { lat: 42.0, lng: 125.0, alt: 510 },
    bb5: { lat: 37.5, lng: 126.5, alt: 508 },
    bb6: { lat: 40.5, lng: 129.0, alt: 511 },
  },

  // -------------------------------------------------------------------------
  // Russia 450-Drone Barrage — Ukraine Energy (Feb 2, 2026)
  // AOI: eastern-ukraine, centroid 48.5°N, 37.8°E
  // -------------------------------------------------------------------------
  'ukraine-barrage': {
    bw3: { lat: 50.0, lng: 35.5, alt: 510 },
    bb1: { lat: 47.0, lng: 40.0, alt: 512 },
    bb2: { lat: 48.5, lng: 37.5, alt: 509 },   // directly over
    bb3: { lat: 50.5, lng: 39.0, alt: 511 },
    bb4: { lat: 49.0, lng: 36.0, alt: 510 },   // over Donetsk
    bb5: { lat: 46.5, lng: 38.0, alt: 508 },
    bb6: { lat: 48.0, lng: 38.5, alt: 511 },
  },

  // -------------------------------------------------------------------------
  // Op. Epic Fury — US/Israel Strike Iran (Feb 28, 2026)
  // AOI: iran, centroid 32.43°N, 53.69°E
  // -------------------------------------------------------------------------
  'epic-fury': {
    bw3: { lat: 35.7, lng: 51.4, alt: 510 },   // over Tehran
    bb1: { lat: 33.7, lng: 51.7, alt: 512 },    // over Natanz
    bb2: { lat: 34.9, lng: 51.6, alt: 509 },    // over Fordow
    bb3: { lat: 36.5, lng: 53.5, alt: 511 },    // northern Iran
    bb4: { lat: 32.6, lng: 51.7, alt: 510 },    // over Isfahan
    bb5: { lat: 29.0, lng: 50.9, alt: 508 },    // over Bushehr
    bb6: { lat: 35.2, lng: 53.9, alt: 511 },    // over space center
  },
};

// Build a fast lookup: event date (ms) → { eventId, positions }
interface EventLookup {
  timeMs: number;
  eventId: string;
  positions: Record<string, PositionOverride>;
}

const EVENT_LOOKUP: EventLookup[] = CORRELATION_EVENTS.map(e => ({
  timeMs: new Date(e.date).getTime(),
  eventId: e.id,
  positions: EVENT_POSITIONS[e.id] || {},
})).filter(e => Object.keys(e.positions).length > 0);

/**
 * Apply event-time position overrides to SGP4-propagated positions.
 * When simulation time is within the blend window of an event, satellite
 * positions are interpolated toward their narrative-accurate locations.
 */
export function applyEventOverrides(
  positions: SatPosition[],
  simulationTime: Date | null,
): SatPosition[] {
  if (!simulationTime) return positions;

  const simMs = simulationTime.getTime();

  // Find the closest event within the blend window
  let closestEvent: EventLookup | null = null;
  let closestDelta = Infinity;

  for (const evt of EVENT_LOOKUP) {
    const delta = Math.abs(simMs - evt.timeMs);
    if (delta < BLEND_WINDOW_MS && delta < closestDelta) {
      closestDelta = delta;
      closestEvent = evt;
    }
  }

  if (!closestEvent) return positions;

  // Blend factor: 1.0 at event time, 0.0 at edge of blend window
  // Snap to 1.0 within the override window
  let blend: number;
  if (closestDelta <= OVERRIDE_WINDOW_MS) {
    blend = 1.0;
  } else {
    // Linear falloff from override window edge to blend window edge
    blend = 1.0 - (closestDelta - OVERRIDE_WINDOW_MS) / (BLEND_WINDOW_MS - OVERRIDE_WINDOW_MS);
  }

  return positions.map(pos => {
    const override = closestEvent!.positions[pos.satId];
    if (!override) return pos;

    return {
      ...pos,
      lat: pos.lat + (override.lat - pos.lat) * blend,
      lng: pos.lng + (override.lng - pos.lng) * blend,
      alt: pos.alt + (override.alt - pos.alt) * blend,
    };
  });
}
