import { NextResponse } from 'next/server';
import { initSatellites, getAllPositions } from '@/lib/orbital/propagator';

export const dynamic = 'force-dynamic';

export async function GET() {
  const satellites = initSatellites();
  const now = new Date();
  const positions = getAllPositions(satellites, now);

  return NextResponse.json({
    positions,
    timestamp: now.toISOString(),
    count: positions.length,
  });
}
