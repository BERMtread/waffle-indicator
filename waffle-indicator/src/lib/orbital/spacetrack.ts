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
 * Uses Space-Track's gp_history class which archives all historical TLE submissions.
 * Much more accurate than back-propagating a current TLE for historical positions.
 */
export async function fetchHistoricalTLEs(
  noradIds: number[],
  date: Date
): Promise<Record<number, TLEData>> {
  const cookie = await getSessionCookie();
  const ids = noradIds.join(',');
  // Look back up to 14 days to find the TLE epoch closest before the requested date
  const endDate = formatISODate(date);
  const startDate = formatISODate(new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000));
  const epochRange = `${startDate}--${endDate}`;
  // orderby EPOCH desc = most recent epoch first; parseTLEBlock keeps first per NORAD ID
  const url = `${SPACETRACK_BASE}/basicspacedata/query/class/gp_history/NORAD_CAT_ID/${ids}/EPOCH/${epochRange}/orderby/EPOCH%20desc/limit/${noradIds.length * 2}/format/tle`;
  const res = await fetch(url, { headers: { Cookie: cookie } });
  if (!res.ok) throw new Error(`Space-Track history fetch failed: HTTP ${res.status}`);
  return parseTLEBlock(await res.text(), noradIds);
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
    // Keep first occurrence only (most recent epoch when ordered desc)
    if (noradIds.includes(noradId) && !result[noradId]) {
      result[noradId] = { line1, line2 };
    }
  }
  return result;
}
