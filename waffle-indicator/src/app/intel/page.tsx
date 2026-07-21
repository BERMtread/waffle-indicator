'use client';

import Link from 'next/link';
import { Ticker } from '@/components/dashboard/Ticker';

const TIMELINE = [
  {"date": "Jun 22, 2025", "op": "Op. Midnight Hammer \u2014 US B-2/Tomahawk strike on Fordow, Natanz & Isfahan", "opScore": 8.3, "phases": [{"name": "Fordow strike (B-2 / GBU-57 MOP)", "score": 6.7, "detail": "best pass 02:22 IRST at 42\u00b0 elev (BB2); 7 min covered, 1 passes in window", "conf": "confirmed"}, {"name": "Natanz strike (MOP + Tomahawk)", "score": 6.0, "detail": "best pass 02:22 IRST at 37\u00b0 elev (BB2); 7 min covered, 1 passes in window", "conf": "confirmed"}, {"name": "Isfahan strike (Tomahawk, final wave)", "score": 8.3, "detail": "best pass 02:47 IRST at 56\u00b0 elev (BB1/BB5); 12 min covered, 2 passes in window", "conf": "confirmed"}]},
  {"date": "Jan 3, 2026", "op": "Op. Absolute Resolve \u2014 US raid captures Maduro in Caracas", "opScore": 8.7, "phases": [{"name": "Ingress & assault on Maduro compound (Caracas)", "score": 0.0, "detail": "no waffle pass over the target during this phase window", "conf": "confirmed"}, {"name": "Exfiltration with Maduro", "score": 8.7, "detail": "best pass 03:57 VET at 61\u00b0 elev (BB4); 40 min covered, 5 passes in window", "conf": "confirmed"}]},
  {"date": "Feb 28, 2026", "op": "Op. Epic Fury \u2014 US/Israel open joint strikes on Iran", "opScore": 8.5, "phases": [{"name": "Opening strikes / Khamenei decapitation (Tehran)", "score": 1.9, "detail": "best pass 01:18 ET at 11\u00b0 elev (BW3); 2 min covered, 1 passes in window", "conf": "confirmed"}, {"name": "Nuclear facility strikes (Fordow)", "score": 8.5, "detail": "best pass 02:53 ET at 58\u00b0 elev (BW3); 7 min covered, 1 passes in window", "conf": "confirmed"}]},
  {"date": "Apr 3, 2026", "op": "Epic Fury sub-op \u2014 Dude 44 pilot CSAR recovery", "opScore": 1.9, "phases": [{"name": "Pilot extraction (Kohgiluyeh & Boyer-Ahmad)", "score": 1.9, "detail": "best pass 11:43 IRST at 11\u00b0 elev (BB6); 2 min covered, 1 passes in window", "conf": "approx"}]},
  {"date": "Apr 5, 2026", "op": "Epic Fury sub-op \u2014 Dude 44 WSO CSAR recovery", "opScore": 0.0, "phases": [{"name": "WSO extraction (near Yasuj)", "score": 0.0, "detail": "no waffle pass over the target during this phase window", "conf": "approx"}]},
  {"date": "Jul 7, 2026", "op": "Epic Fury ceasefire break \u2014 US strikes 80+ Strait of Hormuz targets", "opScore": 4.6, "phases": [{"name": "Strait of Hormuz strikes (Qeshm / Bandar Abbas / Sirik)", "score": 4.6, "detail": "best pass 01:16 IRST 08 Jul at 28\u00b0 elev (BB10/BB8/BB9/BW3); 14 min covered, 1 passes in window", "conf": "approx"}]},
  {"date": "Jul 8, 2026", "op": "Epic Fury ceasefire break \u2014 US strikes ~90 sites incl. Bushehr", "opScore": 8.3, "phases": [{"name": "Bushehr / southern Iran strikes", "score": 8.3, "detail": "best pass 02:15 IRST 09 Jul at 56\u00b0 elev (BW3); 19 min covered, 2 passes in window", "conf": "approx"}]},
  {"date": "Jul 11, 2026", "op": "Epic Fury ceasefire break 7/11 \u2014 US strikes Strait of Hormuz", "opScore": 9.9, "phases": [{"name": "Strait of Hormuz strike (7/11)", "score": 9.9, "detail": "best pass 03:54 IRST 12 Jul at 83\u00b0 elev (BB3); 47 min covered, 8 passes in window", "conf": "approx"}]},
  {"date": "Jul 12, 2026", "op": "Epic Fury ceasefire break 7/12 \u2014 US strikes Strait of Hormuz", "opScore": 9.3, "phases": [{"name": "Strait of Hormuz strike (7/12)", "score": 9.3, "detail": "best pass 00:14 IRST 13 Jul at 69\u00b0 elev (BB10/BB8/BB9); 30 min covered, 6 passes in window", "conf": "approx"}]},
  {"date": "Jul 13, 2026", "op": "Epic Fury ceasefire break 7/13 \u2014 US strikes Strait of Hormuz", "opScore": 10.0, "phases": [{"name": "Strait of Hormuz strike (7/13)", "score": 10.0, "detail": "best pass 00:01 IRST 14 Jul at 88\u00b0 elev (BB10/BB8/BB9); 26 min covered, 5 passes in window", "conf": "approx"}]},
  {"date": "Jul 14, 2026", "op": "Epic Fury ceasefire break 7/14 \u2014 US strikes Strait of Hormuz", "opScore": 10.0, "phases": [{"name": "Strait of Hormuz strike (7/14)", "score": 10.0, "detail": "best pass 23:48 IRST 14 Jul at 86\u00b0 elev (BB10/BB8/BB9); 32 min covered, 6 passes in window", "conf": "approx"}]},
  {"date": "Jul 15, 2026 (AM)", "op": "Epic Fury ceasefire break 7/15a \u2014 US strikes Strait of Hormuz", "opScore": 5.6, "phases": [{"name": "Strait of Hormuz strike (7/15a)", "score": 5.6, "detail": "best pass 15:12 IRST 15 Jul at 34\u00b0 elev (BB10/BB8/BB9); 28 min covered, 2 passes in window", "conf": "approx"}]},
  {"date": "Jul 15, 2026 (PM)", "op": "Epic Fury ceasefire break 7/15b \u2014 US strikes Strait of Hormuz", "opScore": 9.3, "phases": [{"name": "Strait of Hormuz strike (7/15b)", "score": 9.3, "detail": "best pass 23:30 IRST 15 Jul at 68\u00b0 elev (BB10/BB8/BB9/BW3); 36 min covered, 4 passes in window", "conf": "approx"}]},
  {"date": "Jul 16, 2026", "op": "Epic Fury ceasefire break 7/16 \u2014 US strikes Strait of Hormuz", "opScore": 7.9, "phases": [{"name": "Strait of Hormuz strike (7/16)", "score": 7.9, "detail": "best pass 23:23 IRST 16 Jul at 52\u00b0 elev (BB8/BB9); 26 min covered, 3 passes in window", "conf": "approx"}]},
  {"date": "Jul 17, 2026", "op": "Epic Fury ceasefire break 7/17 \u2014 US strikes Strait of Hormuz", "opScore": 9.7, "phases": [{"name": "Strait of Hormuz strike (7/17)", "score": 9.7, "detail": "best pass 22:15 IRST 17 Jul at 76\u00b0 elev (BW3); 40 min covered, 4 passes in window", "conf": "approx"}]},
  {"date": "Jul 18, 2026", "op": "Epic Fury ceasefire break 7/18 \u2014 US strikes Strait of Hormuz", "opScore": 9.2, "phases": [{"name": "Strait of Hormuz strike (7/18)", "score": 9.2, "detail": "best pass 01:04 IRST 19 Jul at 67\u00b0 elev (BB1/BB5); 44 min covered, 6 passes in window", "conf": "approx"}]},
  {"date": "Jul 19, 2026", "op": "Epic Fury ceasefire break 7/19 \u2014 US strikes Strait of Hormuz", "opScore": 6.7, "phases": [{"name": "Strait of Hormuz strike (7/19)", "score": 6.7, "detail": "best pass 02:52 IRST 20 Jul at 42\u00b0 elev (BB6); 19 min covered, 3 passes in window", "conf": "approx"}]},
  {"date": "Jul 20, 2026", "op": "Epic Fury ceasefire break 7/20 \u2014 US strikes Strait of Hormuz", "opScore": 9.6, "phases": [{"name": "Strait of Hormuz strike (7/20)", "score": 9.6, "detail": "best pass 00:24 IRST 21 Jul at 74\u00b0 elev (BB1/BB5); 58 min covered, 8 passes in window", "conf": "approx"}]},
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
          <h2 className="panel-header text-[14px]">THE SYRUP THESIS (v4 — PHASE / BEST PASS)</h2>
          <div className="space-y-4 text-[12px] leading-relaxed text-[var(--color-text-dim)]">
            <p>
              <span className="text-[var(--color-waffle)] font-bold">Operations have phases.</span>{' '}
              A single kickoff timestamp is the wrong yardstick for something that unfolds over hours. A capture
              raid has an ingress, an assault, and an exfiltration — and the exfil, with the high-value target
              aboard, is often the most sensitive phase of all. So each operation is broken into its critical
              phases, each with its own time window and point target.
            </p>
            <p>
              <span className="text-[var(--color-ok)] font-bold">Score = 10 · sin(elevation)</span>{' '}
              of the single most directly-overhead ASTS pass during the phase window. A near-overhead pass gives the
              array a short slant range and a near-nadir look (90° → 10); a low grazing pass barely sees the target
              (11° → 1.9); no pass at all → 0. Every window and target is researched and propagated from real Space-Track orbits.
            </p>
            <p>
              <span className="text-[var(--color-danger)] font-bold">This corrects the earlier single-instant read.</span>{' '}
              Op. Absolute Resolve looked like a miss when judged on its 02:01 kickoff — but its exfil phase caught a
              61° near-overhead pass right as Maduro was flown out (8.7). Op. Epic Fury&apos;s real coverage was the
              Fordow nuclear phase (58°), not the grazing Tehran opening. Op. Midnight Hammer, meanwhile, is a real hit — a
              56° near-overhead pass sat over Isfahan during the final Tomahawk wave (8.3).
            </p>
          </div>
        </section>

        {/* Statistical Evidence */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">PHASE COINCIDENCE</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-ok)]">4 / 7</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Events with a strong phase</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-waffle)]">61°</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Best pass — Maduro exfil</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-danger)]">8.7</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Top phase score</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-blue)]">1</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Unscored (no reported time)</div>
            </div>
          </div>
          <div className="text-[11px] text-[var(--color-text-dim)] leading-relaxed space-y-2">
            <p>
              Four of the seven time-anchored events had a well-placed pass during a critical phase: the Maduro
              exfil (61°, BB4), the Epic Fury Fordow strike (58°, BW3), Op. Midnight Hammer over Isfahan (56°,
              BB1/BB5), and the 7/8 ceasefire-break strike on Bushehr (56°, BW3). The 7/7 Hormuz strike caught only a
              28° pass (4.6) — notably from the newer BB8/9/10 plane — while the WSO extraction near Yasuj was a clean
              miss, and the Epic Fury Tehran opening and pilot recovery had only grazing sub-11° passes.
            </p>
            <p>
              Elevation is doing real work here: several &quot;near passes&quot; from the single-instant model turn out to be
              low grazing looks worth little. A phase only earns a high score when a waffle is genuinely overhead while
              it matters. This is an orbital-mechanics curiosity, not intelligence — rescue-phase times are approximate.
            </p>
          </div>
        </section>

        {/* Operations Timeline */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">OPERATIONS TIMELINE</h2>
          <div className="space-y-4">
            {TIMELINE.map((item, i) => (
              <div key={i} className="border-l-2 pl-3" style={{ borderColor: item.opScore === null ? '#888' : item.opScore >= 8 ? '#FF0040' : item.opScore >= 5 ? '#FF6B00' : item.opScore >= 2 ? '#F5A623' : '#00FF88' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[var(--color-text)] text-[12px] font-bold">{item.date}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: item.opScore === null ? '#AAA' : item.opScore >= 8 ? '#FF0040' : item.opScore >= 5 ? '#FF6B00' : item.opScore >= 2 ? '#F5A623' : '#00FF88',
                      backgroundColor: item.opScore === null ? '#88888820' : item.opScore >= 8 ? '#FF004015' : item.opScore >= 5 ? '#FF6B0015' : item.opScore >= 2 ? '#F5A62315' : '#00FF8815',
                    }}
                  >
                    {item.opScore === null ? 'SYRUP N/A' : `SYRUP ${item.opScore.toFixed(1)}`}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--color-text-dim)] mt-0.5">{item.op}</div>
                <div className="mt-2 space-y-1.5">
                  {item.phases.map((p, j) => (
                    <div key={j} className="flex gap-2 text-[10px]">
                      <span
                        className="font-bold px-1 py-0.5 rounded flex-shrink-0 h-fit"
                        style={{
                          color: p.score === null ? '#AAA' : p.score >= 8 ? '#FF0040' : p.score >= 5 ? '#FF6B00' : p.score >= 2 ? '#F5A623' : '#00FF88',
                          backgroundColor: p.score === null ? '#88888820' : p.score >= 8 ? '#FF004015' : p.score >= 5 ? '#FF6B0015' : p.score >= 2 ? '#F5A62315' : '#00FF8815',
                        }}
                      >
                        {p.score === null ? 'N/A' : p.score.toFixed(1)}
                      </span>
                      <div>
                        <span className="text-[var(--color-text)]">{p.name}</span>
                        {p.conf !== 'confirmed' && (
                          <span className="text-[8px] text-[var(--color-text-muted)] uppercase ml-1">[{p.conf}]</span>
                        )}
                        <div className="text-[var(--color-text-muted)]">{p.detail}</div>
                      </div>
                    </div>
                  ))}
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
