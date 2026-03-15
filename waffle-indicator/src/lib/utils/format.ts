export function formatCoord(deg: number, type: 'lat' | 'lng'): string {
  const dir = type === 'lat' ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${Math.abs(deg).toFixed(1)}°${dir}`;
}

export function formatDistance(km: number): string {
  if (km === Infinity) return '—';
  if (km < 1) return '<1 km';
  if (km < 1000) return `${Math.round(km)} km`;
  return `${(km / 1000).toFixed(1)}k km`;
}

export function formatElevation(deg: number): string {
  return `${deg.toFixed(1)}°`;
}

export function formatWaffleLevel(level: number): string {
  return level.toFixed(1);
}

export function formatVelocity(kmPerSec: number): string {
  return `${kmPerSec.toFixed(2)} km/s`;
}

export function formatAltitude(km: number): string {
  return `${Math.round(km)} km`;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
