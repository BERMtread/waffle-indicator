'use client';

import Link from 'next/link';
import { Ticker } from '@/components/dashboard/Ticker';

const TIMELINE = [
  { date: 'May 25, 2026', score: 1.1, gap: 'nearest waffle pass 33 min before', event: 'Epic Fury ceasefire — US "self-defense" strikes on IRGC mine-laying boats + Bandar Abbas SAM site. Time of day not reported.', type: 'miss', conf: 'time unconfirmed' },
  { date: 'Apr 5, 2026', score: 0.0, gap: 'no pass within \u00b1120 min', event: 'Epic Fury CSAR — F-15E "Dude 44" WSO extracted (~03:00 IRST) near Yasuj after ~46h evading. Critical point: crash site.', type: 'miss', conf: 'time approximate' },
  { date: 'Apr 3, 2026', score: 8.2, gap: 'nearest waffle pass 3 min after', event: 'Epic Fury CSAR — "Dude 44" pilot recovered ~7h after the F-15E was downed in Kohgiluyeh & Boyer-Ahmad. Critical point: recovery site.', type: 'correlation', conf: 'time approximate' },
  { date: 'Feb 28, 2026', score: 8.1, gap: 'nearest waffle pass 3 min after', event: 'Op. Epic Fury — US/Israel open joint strikes on Iran (01:15 ET). Khamenei killed. Critical point: Tehran.', type: 'correlation', conf: 'confirmed' },
  { date: 'Jan 3, 2026', score: 0.1, gap: 'nearest waffle pass 66 min after', event: 'Op. Absolute Resolve — Delta Force captures Maduro in Caracas (02:01 VET). Critical point: Maduro compound.', type: 'miss', conf: 'confirmed' },
  { date: 'Jun 13, 2025', score: 0.1, gap: 'nearest waffle pass 70 min after', event: 'Op. Rising Lion — Israel opens strikes on Iran. First IAF wave (~03:00 IRST) hits leadership and air defenses. Critical point: Tehran.', type: 'miss', conf: 'confirmed' },
];

export default function IntelPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Ticker />
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--color-panel)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="text-lg">🧇</span>
          <h1 className="text-[13px] font-bold text-[var(--color-waffle)] tracking-wide">
            SYRUP METER — INTEL
          </h1>
        </div>
        <nav className="flex gap-1 text-[11px] font-bold tracking-wider">
          <Link href="/tracker" className="px-3 py-1.5 rounded border border-[var(--color-border-bright)] text-[var(--color-text-dim)] hover:border-[var(--color-waffle)] hover:text-[var(--color-waffle)] hover:bg-[var(--color-waffle)]/5 transition-colors">TRACKER</Link>
          <Link href="/intel" className="px-3 py-1.5 rounded border border-[var(--color-waffle)] bg-[var(--color-waffle)]/15 text-[var(--color-waffle)]">INTEL</Link>
          <Link href="/predictions" className="px-3 py-1.5 rounded border border-[var(--color-border-bright)] text-[var(--color-text-dim)] hover:border-[var(--color-waffle)] hover:text-[var(--color-waffle)] hover:bg-[var(--color-waffle)]/5 transition-colors">PREDICTIONS</Link>
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {/* Thesis */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">THE SYRUP THESIS (v3 — CRITICAL MOMENT)</h2>
          <div className="space-y-4 text-[12px] leading-relaxed text-[var(--color-text-dim)]">
            <p>
              <span className="text-[var(--color-waffle)] font-bold">The right question is narrow.</span>{' '}
              The Block-1 BlueBirds fly as a single-plane train, so any given point on the ground sits inside a
              footprint only during a handful of short passes a day. That makes coincidence meaningful: for a specific
              operation, did a waffle happen to be overhead the exact target at the critical instant — the strike
              kickoff, the extraction — or, if not, how close in time was the nearest pass?
            </p>
            <p>
              <span className="text-[var(--color-ok)] font-bold">The score.</span>{' '}
              Each event is scored <span className="text-[var(--color-waffle)] font-bold">10 · exp(−gap / 15)</span>,
              where <em>gap</em> is the minutes between the critical moment and the nearest instant the target is inside
              any footprint. Overhead at the moment scores 10; a pass 15 minutes away ~3.7; an hour away, essentially 0.
              Every timestamp is researched to the reported kickoff/extraction time and propagated from real Space-Track orbits.
            </p>
            <p>
              <span className="text-[var(--color-danger)] font-bold">The result is mixed — and that is the honest part.</span>{' '}
              Of the three headline operations, only <span className="text-[var(--color-text)] font-bold">Op. Epic Fury</span> had a
              waffle near its critical moment (a pass just ~3 minutes after kickoff over Tehran). Op. Rising Lion and the
              Maduro raid were clean misses — the nearest pass was over an hour away. Among the Epic Fury sub-events, the
              downed-pilot recovery lines up with a pass ~3 minutes out, while the WSO extraction had no pass within two hours.
            </p>
          </div>
        </section>

        {/* Statistical Evidence */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">CRITICAL-MOMENT COINCIDENCE</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-ok)]">2 / 6</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Critical moments with a near pass</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-danger)]">0 / 6</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Waffle overhead at the exact instant</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-waffle)]">3 min</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Best near-pass (Epic Fury / Tehran)</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-blue)]">8.2</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Top critical score</div>
            </div>
          </div>
          <div className="text-[11px] text-[var(--color-text-dim)] leading-relaxed space-y-2">
            <p>
              At none of the six critical instants was a waffle exactly overhead — expected, given how briefly the train
              dwells over any single point. What varies is the gap to the nearest pass: ~3 minutes for Epic Fury and the
              pilot recovery, versus 66–70 minutes for Rising Lion and the Maduro raid, and no pass at all within two hours
              for the WSO extraction. Two of six qualify as genuine near-coincidences.
            </p>
            <p>
              Caveats matter here. The strike kickoffs (Rising Lion, Epic Fury, Absolute Resolve) are timed to reported
              minutes; the two rescues are approximate to the hour, and the May 25 Hormuz strike has no reported time of day
              (scored at a nominal noon and flagged). A few-minute shift in an assumed time can swing a point-target score,
              so treat the rescue and Hormuz numbers as indicative. This remains an orbital-mechanics curiosity, not intelligence.
            </p>
          </div>
        </section>

        {/* Operations Timeline */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">OPERATIONS TIMELINE</h2>
          <div className="space-y-3">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-3 text-[11px]">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        item.type === 'correlation' ? '#FF0040' :
                        item.type === 'alignment' ? '#F5A623' : '#4488FF',
                    }}
                  />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-[var(--color-border)]" />}
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[var(--color-text)]">{item.date}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: item.score >= 8 ? '#FF0040' : item.score >= 5 ? '#FF6B00' : item.score >= 2 ? '#F5A623' : '#00FF88',
                        backgroundColor: item.score >= 8 ? '#FF004015' : item.score >= 5 ? '#FF6B0015' : item.score >= 2 ? '#F5A62315' : '#00FF8815',
                      }}
                    >
                      SYRUP {item.score.toFixed(1)}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                      style={{
                        color: item.type === 'correlation' ? '#00FF88' : '#FF6B6B',
                        borderColor: item.type === 'correlation' ? '#00FF8840' : '#FF6B6B40',
                      }}
                    >
                      {item.type === 'correlation' ? 'NEAR PASS' : 'MISS'}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)] uppercase">{item.conf}</span>
                  </div>
                  <div className="text-[var(--color-text-dim)] mt-0.5">{item.event}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 italic">{item.gap}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Satellite Catalog */}
        <section className="panel p-6">
          <h2 className="panel-header text-[14px]">ASTS CONSTELLATION CATALOG</h2>
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider">
                <th className="text-left pb-2">ID</th>
                <th className="text-left pb-2">NAME</th>
                <th className="text-left pb-2">NORAD</th>
                <th className="text-left pb-2">TYPE</th>
                <th className="text-right pb-2">WEIGHT</th>
                <th className="text-right pb-2">ARRAY</th>
                <th className="text-left pb-2">LAUNCHED</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'BW3', name: 'BlueWalker 3', norad: 53807, type: 'Prototype', weight: 3.5, array: '64 m²', launched: '2022-09-11', color: '#F5A623' },
                { id: 'BB1', name: 'BlueBird 1', norad: 61047, type: 'Block 1', weight: 1.5, array: '64 m²', launched: '2024-09-12', color: '#FF6B35' },
                { id: 'BB2', name: 'BlueBird 2', norad: 61048, type: 'Block 1', weight: 1.5, array: '64 m²', launched: '2024-09-12', color: '#FF6B35' },
                { id: 'BB3', name: 'BlueBird 3', norad: 61045, type: 'Block 1', weight: 1.5, array: '64 m²', launched: '2024-09-12', color: '#FF6B35' },
                { id: 'BB4', name: 'BlueBird 4', norad: 61049, type: 'Block 1', weight: 1.5, array: '64 m²', launched: '2024-09-12', color: '#FF6B35' },
                { id: 'BB5', name: 'BlueBird 5', norad: 61046, type: 'Block 1', weight: 1.5, array: '64 m²', launched: '2024-09-12', color: '#FF6B35' },
                { id: 'BB6', name: 'BlueBird 6', norad: 67232, type: 'Block 2', weight: 2.5, array: '223 m²', launched: '2025-12-24', color: '#00FF88' },
              ].map((sat) => (
                <tr key={sat.id} className="border-t border-[var(--color-border)]">
                  <td className="py-1.5"><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: sat.color }} />{sat.id}</td>
                  <td className="py-1.5 text-[var(--color-text-dim)]">{sat.name}</td>
                  <td className="py-1.5">{sat.norad}</td>
                  <td className="py-1.5 text-[var(--color-text-dim)]">{sat.type}</td>
                  <td className="py-1.5 text-right font-bold" style={{ color: sat.color }}>{sat.weight}</td>
                  <td className="py-1.5 text-right">{sat.array}</td>
                  <td className="py-1.5 text-[var(--color-text-dim)]">{sat.launched}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
