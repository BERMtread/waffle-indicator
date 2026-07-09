import { NextResponse } from 'next/server';
import { initSatellites, getAllPositions } from '@/lib/orbital/propagator';
import { computeWaffleLevel } from '@/lib/orbital/alignment-scorer';
import { scoreCoverageWindow } from '@/lib/orbital/coverage-window';
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

    // Coverage-duration methodology (v2): ?mode=window&windowMin=1440
    // Scores how OFTEN and how LONG the AOI is actually covered over a window,
    // instead of the instantaneous "how many waffles are stacked right now".
    if (searchParams.get('mode') === 'window') {
      const windowMin = Math.min(4320, Math.max(60, Number(searchParams.get('windowMin')) || 1440));
      const window = scoreCoverageWindow(satellites, aoi, now, windowMin);
      return NextResponse.json({
        aoiId: aoi.id,
        methodology: 'coverage-window-v2',
        instantaneous: { waffleLevel: coverage.waffleLevel, satsInFootprint: coverage.satsInFootprint.length },
        window,
        timestamp: now.toISOString(),
      });
    }

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
