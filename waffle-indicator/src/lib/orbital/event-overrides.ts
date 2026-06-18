import type { SatPosition } from './propagator';

/**
 * Event position overrides have been removed.
 * Satellite positions are now sourced exclusively from Space-Track historical TLEs
 * via the gp_history archive, providing real orbital data for every event date.
 *
 * This file is kept as a stub to avoid import errors during transition.
 */

// No-op: returns positions unchanged. Kept only for backward compatibility.
export function applyEventOverrides(
  positions: SatPosition[],
  _simulationTime: Date | null,
): SatPosition[] {
  return positions;
}
