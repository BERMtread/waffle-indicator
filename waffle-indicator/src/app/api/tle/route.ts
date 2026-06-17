import { NextResponse } from 'next/server';
import { NORAD_IDS, FALLBACK_TLES } from '@/lib/orbital/constants';
import { fetchCurrentTLEs } from '@/lib/orbital/spacetrack';

export const revalidate = 14400; // Cache for 4 hours

export async function GET() {
  try {
    const tles = await fetchCurrentTLEs(NORAD_IDS);

    // Fill in any satellites missing from Space-Track response with fallbacks
    let usedFallback = false;
    for (const id of NORAD_IDS) {
      if (!tles[id] && FALLBACK_TLES[id]) {
        tles[id] = FALLBACK_TLES[id];
        usedFallback = true;
      }
    }

    return NextResponse.json({
      tles,
      source: usedFallback ? 'mixed' : 'space-track',
      fetchedAt: new Date().toISOString(),
      count: Object.keys(tles).length,
    });
  } catch (err) {
    console.error('[/api/tle] Space-Track fetch failed, using fallbacks:', err);
    return NextResponse.json({
      tles: FALLBACK_TLES,
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
      count: Object.keys(FALLBACK_TLES).length,
    });
  }
}
