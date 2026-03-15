import { NextResponse } from 'next/server';
import { NORAD_IDS, FALLBACK_TLES } from '@/lib/orbital/constants';

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';

export async function GET() {
  try {
    // Try fetching live TLEs from CelesTrak
    const tles: Record<number, { line1: string; line2: string }> = {};
    const results = await Promise.allSettled(
      NORAD_IDS.map(async (id) => {
        const res = await fetch(
          `${CELESTRAK_BASE}?CATNR=${id}&FORMAT=tle`,
          { next: { revalidate: 14400 } } // 4 hours
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const lines = text.trim().split('\n');
        if (lines.length >= 3) {
          return {
            noradId: id,
            line1: lines[1].trim(),
            line2: lines[2].trim(),
            name: lines[0].trim(),
          };
        }
        throw new Error('Invalid TLE format');
      })
    );

    let usedFallback = false;
    for (const result of results) {
      if (result.status === 'fulfilled') {
        tles[result.value.noradId] = {
          line1: result.value.line1,
          line2: result.value.line2,
        };
      }
    }

    // Fill in any missing with fallbacks
    for (const id of NORAD_IDS) {
      if (!tles[id] && FALLBACK_TLES[id]) {
        tles[id] = FALLBACK_TLES[id];
        usedFallback = true;
      }
    }

    return NextResponse.json({
      tles,
      source: usedFallback ? 'mixed' : 'celestrak',
      fetchedAt: new Date().toISOString(),
      count: Object.keys(tles).length,
    });
  } catch {
    // Full fallback
    return NextResponse.json({
      tles: FALLBACK_TLES,
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
      count: Object.keys(FALLBACK_TLES).length,
    });
  }
}
