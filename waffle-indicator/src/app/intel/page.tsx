'use client';

import Link from 'next/link';
import { Ticker } from '@/components/dashboard/Ticker';

const TIMELINE = [
  { date: 'Feb 28, 2026', level: 9.8, event: 'Op. Epic Fury / Op. Roaring Lion. US + Israel joint strikes on Tehran, Isfahan, Qom, Karaj. Full constellation + BB6 aligned over Iran. Supreme Leader killed. Highest waffle ever recorded.', type: 'correlation' },
  { date: 'Feb 2-3, 2026', level: 7.4, event: 'Russia launches 450 drones + 71 missiles at Ukraine energy grid. Massive barrage across Kyiv, Kharkiv, Odesa. BB3/BB1/BB6 over Eastern Ukraine.', type: 'correlation' },
  { date: 'Jan 27, 2026', level: 3.8, event: 'DPRK fires ballistic missiles into sea ahead of political congress. BB2/BB3 alignment over Korean Peninsula.', type: 'alignment' },
  { date: 'Jan 4, 2026', level: 4.8, event: 'DPRK multiple ballistic missile salvo (900 km range). Kim orders 250% production increase. BB2/BB3 in footprint.', type: 'alignment' },
  { date: 'Jan 3, 2026', level: 5.6, event: 'Op. Absolute Resolve. Delta Force captures Maduro in Caracas. US bombs Venezuelan air defenses. BW3/BB4/BB5 aligned.', type: 'correlation' },
  { date: 'Dec 29-30, 2025', level: 8.1, event: 'PLA "Justice Mission 2025" — 130 aircraft sorties, 27 rockets from Fujian, 10 land in Taiwan contiguous zone. BB1/BB2/BB3/BB4 full coverage of Taiwan Strait.', type: 'correlation' },
  { date: 'Dec 24, 2025', level: null, event: 'BB6 (Block 2) launched. 223 m² array — 3.5x larger than Block 1. Constellation at full strength.', type: 'launch' },
  { date: 'Dec 8, 2025', level: 6.0, event: 'RSF seizes Heglig oilfield (Sudan\'s largest). BB5/BB6 alignment over Kordofan region.', type: 'alignment' },
  { date: 'Oct 26, 2025', level: 6.2, event: 'RSF overruns El Fasher after 500-day siege. Mass atrocity event. BW3/BB5/BB6 aligned over North Darfur.', type: 'correlation' },
  { date: 'Aug 28, 2025', level: 5.1, event: 'Israeli airstrike kills Houthi PM in Sanaa. BB1/BB4 alignment over Yemen.', type: 'correlation' },
  { date: 'Aug 20, 2025', level: 4.2, event: 'China deploys armed boats to Second Thomas Shoal, 50m from BRP Sierra Madre. BB1/BB2 in SCS footprint.', type: 'alignment' },
  { date: 'Aug 11, 2025', level: 4.5, event: 'China Coast Guard vessel collides with PLA Navy ship at Scarborough Shoal. BB1/BB2 aligned.', type: 'alignment' },
  { date: 'Jun 21-22, 2025', level: 8.5, event: 'US joins Twelve-Day War — strikes Fordow, Natanz, Isfahan. BW3/BB1/BB4/BB5 over Iran. Second major Iran correlation.', type: 'correlation' },
  { date: 'Jun 13, 2025', level: 9.2, event: 'Op. Rising Lion begins. Israel strikes Natanz, Isfahan, Fordow, Arak. Assassinates nuclear scientists. BW3/BB1/BB4/BB5 aligned.', type: 'correlation' },
  { date: 'May 7, 2025', level: 7.0, event: 'Op. Sindoor. India strikes JeM/LeT targets in Pakistan + Azad Kashmir. BW3/BB2/BB4 aligned over India-Pakistan border.', type: 'correlation' },
  { date: 'May 4, 2025', level: 5.8, event: 'Houthi hypersonic missile evades THAAD/Arrow, strikes Ben Gurion Airport perimeter. BB1/BB5 over Red Sea/Yemen.', type: 'alignment' },
  { date: 'Sep 12, 2024', level: null, event: 'Block 1 BlueBirds launched (BB1-BB5). Constellation enters operational phase.', type: 'launch' },
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
          <h2 className="panel-header text-[14px]">THE SYRUP THESIS</h2>
          <div className="space-y-4 text-[12px] leading-relaxed text-[var(--color-text-dim)]">
            <p>
              <span className="text-[var(--color-waffle)] font-bold">The Pizza Index is a lagging indicator.</span>{' '}
              Late-night pizza deliveries near the Pentagon tell you something already happened. By the time Dominos
              trucks are spotted at 2 AM, the operation is already underway.
            </p>
            <p>
              <span className="text-[var(--color-ok)] font-bold">The Syrup Meter is a leading indicator.</span>{' '}
              LEO orbital geometry is deterministic. AST SpaceMobile satellites have massive phased-array antennas
              that look like waffles (64-223 m&sup2;). Their orbits are governed by Keplerian mechanics — you can predict
              exactly where they&apos;ll be days or weeks in advance using SGP4 propagation from public TLE data.
            </p>
            <p>
              <span className="text-[var(--color-danger)] font-bold">The core insight:</span>{' '}
              When multiple ASTS &quot;waffles&quot; align over a geopolitical hotspot, it creates a coverage window.
              Since June 2025, we&apos;ve tracked <span className="text-[var(--color-waffle)] font-bold">9 confirmed correlations</span> across
              Iran, Ukraine, Taiwan, Pakistan, Sudan, and Venezuela — with a random coincidence probability well below 1%.
              The Feb 28, 2026 joint US-Israel strike on Iran (Op. Epic Fury) hit syrup level 9.8 — the highest ever recorded.
            </p>
          </div>
        </section>

        {/* Statistical Evidence */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">STATISTICAL EVIDENCE</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-danger)]">{'<'}0.1%</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">P(Random Coincidence)</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-waffle)]">9</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Confirmed Correlations</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-ok)]">6</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">AOI Regions Hit</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-card)] rounded">
              <div className="text-[28px] font-bold text-[var(--color-blue)]">9.8</div>
              <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Peak Syrup (Iran)</div>
            </div>
          </div>
          <div className="text-[11px] text-[var(--color-text-dim)] leading-relaxed space-y-2">
            <p>
              Since the Block 1 constellation became operational in late 2024, the syrup meter has correlated with
              major military operations across 6 distinct geographic regions: Iran (3x), Ukraine, Taiwan Strait, Pakistan,
              Sudan, and Venezuela. The Iran correlations are the strongest — Op. Rising Lion (Jun 2025, SYRUP 9.2),
              US joining strikes (Jun 2025, SYRUP 8.5), and Op. Epic Fury (Feb 2026, SYRUP 9.8) all hit DROWNING thresholds.
            </p>
            <p>
              The Dec 29 PLA Justice Mission blockade drill (SYRUP 8.1) and the India-Pakistan Op. Sindoor (SYRUP 7.0)
              demonstrate coverage extends well beyond the Middle East. BB6&apos;s December 2025 launch (223 m&sup2; array,
              2.5x weight) has significantly increased constellation capability — the Feb 28 Iran event was the first
              full-constellation alignment including BB6.
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
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-text)]">{item.date}</span>
                    {item.level !== null && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: item.level >= 8 ? '#FF0040' : item.level >= 6 ? '#FF6B00' : item.level >= 4 ? '#F5A623' : '#00FF88',
                          backgroundColor: item.level >= 8 ? '#FF004015' : item.level >= 6 ? '#FF6B0015' : item.level >= 4 ? '#F5A62315' : '#00FF8815',
                        }}
                      >
                        SYRUP {item.level.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="text-[var(--color-text-dim)] mt-0.5">{item.event}</div>
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
