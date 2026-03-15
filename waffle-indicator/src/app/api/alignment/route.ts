import { NextResponse } from 'next/server';
import { initSatellites, getAllPositions } from '@/lib/orbital/propagator';
import { computeWaffleLevel } from '@/lib/orbital/alignment-scorer';
import { ALL_AOIS } from '@/lib/geo/aoi-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const aoiId = searchParams.get('aoi');

  const satellites = initSatellites();
  const now = new Date();
  const positions = getAllPositions(satellites, now);

  if (aoiId) {
    const aoi = ALL_AOIS.find(a => a.id === aoiId);
    if (!aoi) {
      return NextResponse.json({ error: `AOI '${aoiId}' not found` }, { status: 404 });
    }
    const coverage = computeWaffleLevel(positions, aoi);
    return NextResponse.json({
      ...coverage,
      timestamp: now.toISOString(),
    });
  }

  // All AOIs
  const results = ALL_AOIS.map(aoi => {
    const coverage = computeWaffleLevel(positions, aoi);
    return {
      ...coverage,
      aoiName: aoi.name,
    };
  });

  // Sort by waffle level descending
  results.sort((a, b) => b.waffleLevel - a.waffleLevel);

  return NextResponse.json({
    results,
    timestamp: now.toISOString(),
    count: results.length,
  });
}
