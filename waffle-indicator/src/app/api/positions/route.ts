import { NextResponse } from 'next/server';
import { initSatellites, getAllPositions } from '@/lib/orbital/propagator';
import { NORAD_IDS, FALLBACK_TLES } from '@/lib/orbital/constants';
import { fetchCurrentTLEs, fetchHistoricalTLEs } from '@/lib/orbital/spacetrack';

export const dynamic = 'force-dynamic';

/**
 * GET /api/positions
 * GET /api/positions?date=YYYY-MM-DD
 *
 * Without date: returns current live positions using the latest TLEs.
 * With date: returns historical positions using the TLE active at that date,
 *            sourced from Space-Track's gp_history archive for accuracy.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  let targetDate: Date;
  let tles: Record<number, { line1: string; line2: string }>;

  if (dateParam) {
    targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: `Invalid date: ${dateParam}` }, { status: 400 });
    }
    try {
      tles = await fetchHistoricalTLEs(NORAD_IDS, targetDate);
    } catch {
      tles = FALLBACK_TLES;
    }
  } else {
    targetDate = new Date();
    try {
      tles = await fetchCurrentTLEs(NORAD_IDS);
    } catch {
      tles = FALLBACK_TLES;
    }
  }

  const satellites = initSatellites(tles);
  const positions = getAllPositions(satellites, targetDate);

  return NextResponse.json({
    positions,
    timestamp: targetDate.toISOString(),
    count: positions.length,
    historical: !!dateParam,
  });
}
