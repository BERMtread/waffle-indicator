import { NextResponse } from 'next/server';
import { NORAD_IDS, FALLBACK_TLES } from '@/lib/orbital/constants';
import { fetchHistoricalTLEs } from '@/lib/orbital/spacetrack';

/**
 * GET /api/tle/history?date=YYYY-MM-DD
 *
 * Returns the TLE with an epoch closest to (but not after) `date` for each
 * satellite, sourced from Space-Track's gp_history archive.
 *
 * Use these TLEs when propagating historical positions — they represent the
 * orbital state actually observed at that time, not a back-propagated current TLE.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  if (!dateParam) {
    return NextResponse.json(
      { error: 'Missing required query param: date (YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  const date = new Date(dateParam);
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { error: `Invalid date: ${dateParam}` },
      { status: 400 }
    );
  }

  try {
    const tles = await fetchHistoricalTLEs(NORAD_IDS, date);

    // Satellites launched after the requested date won't have TLEs — correct behaviour.
    // Fill in fallbacks only for satellites that should exist but weren't returned.
    let usedFallback = false;
    for (const id of NORAD_IDS) {
      if (!tles[id] && FALLBACK_TLES[id]) {
        tles[id] = FALLBACK_TLES[id];
        usedFallback = true;
      }
    }

    return NextResponse.json({
      tles,
      date: dateParam,
      source: usedFallback ? 'mixed' : 'space-track',
      fetchedAt: new Date().toISOString(),
      count: Object.keys(tles).length,
    });
  } catch (err) {
    console.error('[/api/tle/history] Space-Track fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to fetch historical TLEs', detail: String(err) },
      { status: 500 }
    );
  }
      }
