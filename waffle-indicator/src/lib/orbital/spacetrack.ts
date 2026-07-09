/**
 * Space-Track.org API client
 * Requires SPACETRACK_USER and SPACETRACK_PASS environment variables.
 * Register at https://www.space-track.org/auth/createAccount
 */

const SPACETRACK_BASE = 'https://www.space-track.org';

export interface TLEData {
  line1: string;
  line2: string;
}

async function getSessionCookie(): Promise<string> {
  const user = process.env.SPACETRACK_USER;
  const pass = process.env.SPACETRACK_PASS;
  if (!user || !pass) {
    throw new Error('SPACETRACK_USER and SPACETRACK_PASS env vars are required');
  }
  const res = await fetch(`${SPACETRACK_BASE}/ajaxauth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `identity=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
    redirect: 'manual',
  });
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('Space-Track login failed: no session cookie returned');
  return setCookie.split(';')[0];
}

/** Fetch the latest TLE for each NORAD ID from Space-Track */
export async function fetchCurrentTLEs(
  noradIds: number[]
): Promise<Record<number, TLEData>> {
  const cookie = await getSessionCookie();
  const ids = noradIds.join(',');
  const url = `${SPACETRACK_BASE}/basicspacedata/query/class/gp/NORAD_CAT_ID/${ids}/orderby/EPOCH%20desc/format/tle`;
  const res = await fetch(url, { headers: { Cookie: cookie } });
  if (!res.ok) throw new Error(`Space-Track fetch failed: HTTP ${res.status}`);
  return parseTLEBlock(await res.text(), noradIds);
}

/**
 * Fetch the TLE with an epoch closest to (but not after) `date` for each satellite.
 * Queries each satellite individually with EPOCH <= date / limit 1 so we reliably
 * get the most recent TLE before the target date for every satellite, regardless of
 * how many updates Space-Track has for other satellites in that window.
 */
export async function fetchHistoricalTLEs(
  noradIds: number[],
  date: Date
): Promise<Record<number, TLEData>> {
  const cookie = await getSessionCookie();
  // Space-Track's "less-than-or-equal" predicate (%3C%3D) is silently ignored on
  // the gp_history class and returns the LATEST TLE instead of the one before `date`.
  // Use an explicit inclusive range [date-21d -- date+1d] and pick the newest row
  // whose epoch is <= the target date. This reliably yields the real historical TLE.
  const endDate = `${formatISODate(date)}T23:59:59`;
  const startDate = formatISODate(new Date(date.getTime() - 21 * 24 * 3600 * 1000));

  // Parallel per-satellite queries — each returns the most recent TLE at//before `date`
  const results = await Promise.allSettled(
    noradIds.map(async (id) => {
      const url = `${SPACETRACK_BASE}/basicspacedata/query/class/gp_history/NORAD_CAT_ID/${id}/EPOCH/${startDate}--${endDate}/orderby/EPOCH%20desc/limit/1/format/tle`;
      const res = await fetch(url, { headers: { Cookie: cookie } });
      if (!res.ok) throw new Error(`Space-Track history fetch failed for ${id}: HTTP ${res.status}`);
      const parsed = parseTLEBlock(await res.text(), [id]);
      return { id, tle: parsed[id] };
    })
  );

  const result: Record<number, TLEData> = {};
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.tle) {
      result[r.value.id] = r.value.tle;
    }
  }
  return result;
}

function formatISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseTLEBlock(text: string, noradIds: number[]): Record<number, TLEData> {
  const result: Record<number, TLEData> = {};
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  // TLEs come in triplets: name line, line1, line2
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (!line1?.startsWith('1 ') || !line2?.startsWith('2 ')) continue;
    const noradId = parseInt(line1.substring(2, 7).trim(), 10);
    if (noradIds.includes(noradId) && !result[noradId]) {
      result[noradId] = { line1, line2 };
    }
  }
  return result;
}
