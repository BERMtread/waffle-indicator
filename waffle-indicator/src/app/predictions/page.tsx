'use client';

import Link from 'next/link';
import { Ticker } from '@/components/dashboard/Ticker';

// Prediction data based on orbital mechanics + correlation patterns
const PREDICTIONS = [
  {
    date: '2026-03-04',
    time: '~09:15 UTC',
    aoi: 'IRAN',
    level: 6.8,
    confidence: 'HIGH' as const,
    sats: ['BW3', 'BB4', 'BB5'],
    coverage: '~35 min',
    hotspots: ['Isfahan (damaged)', 'Parchin', 'Semnan'],
    pattern: 'Post-strike BDA window — 4 days after Op. Epic Fury',
  },
  {
    date: '2026-03-07',
    time: '~06:30 UTC',
    aoi: 'RED SEA',
    level: 5.4,
    confidence: 'HIGH' as const,
    sats: ['BB1', 'BB5', 'BB6'],
    coverage: '~30 min',
    hotspots: ['Bab el-Mandeb', 'Hodeidah Port'],
    pattern: 'Houthis resumed Red Sea attacks after Feb 28 Iran strikes',
  },
  {
    date: '2026-03-11',
    time: '~14:20 UTC',
    aoi: 'STRAIT OF HORMUZ',
    level: 7.5,
    confidence: 'HIGH' as const,
    sats: ['BW3', 'BB1', 'BB4', 'BB5'],
    coverage: '~45 min',
    hotspots: ['Bandar Abbas', 'Qeshm Island', 'IRGC Naval HQ'],
    pattern: 'Iran retaliation watch — naval chokepoint monitoring',
  },
  {
    date: '2026-03-13',
    time: '~11:40 UTC',
    aoi: 'IRAN',
    level: 8.2,
    confidence: 'MEDIUM' as const,
    sats: ['BW3', 'BB1', 'BB4', 'BB5', 'BB6'],
    coverage: '~55 min',
    hotspots: ['Tehran (govt compounds)', 'Natanz (destroyed)', 'Fordow (destroyed)', 'Isfahan (damaged)'],
    pattern: '13-14d cycle from Feb 28 — full constellation BDA event',
  },
  {
    date: '2026-03-15',
    time: '~08:45 UTC',
    aoi: 'TAIWAN STRAIT',
    level: 5.8,
    confidence: 'MEDIUM' as const,
    sats: ['BB1', 'BB2', 'BB3'],
    coverage: '~25 min',
    hotspots: ['TSMC Hsinchu', 'Kinmen Islands', 'Fujian Coast'],
    pattern: 'Post-Justice Mission monitoring cycle',
  },
  {
    date: '2026-03-18',
    time: '~22:10 UTC',
    aoi: 'UKRAINE EAST',
    level: 5.2,
    confidence: 'MEDIUM' as const,
    sats: ['BB6', 'BB1', 'BB3'],
    coverage: '~25 min',
    hotspots: ['Zaporizhzhia NPP', 'Pokrovsk Front'],
    pattern: 'Elevated after Feb 2-3 energy barrage pattern',
  },
  {
    date: '2026-03-22',
    time: '~17:30 UTC',
    aoi: 'SUDAN',
    level: 4.8,
    confidence: 'LOW' as const,
    sats: ['BW3', 'BB5'],
    coverage: '~20 min',
    hotspots: ['El Obeid', 'Khartoum'],
    pattern: 'RSF advance toward capital — Kordofan corridor',
  },
  {
    date: '2026-03-27',
    time: '~15:30 UTC',
    aoi: 'IRAN',
    level: 8.8,
    confidence: 'LOW' as const,
    sats: ['BW3', 'BB1', 'BB4', 'BB5', 'BB6'],
    coverage: '~60 min',
    hotspots: ['Tehran', 'Isfahan', 'Parchin', 'Semnan Launch'],
    pattern: '27-28d from Feb 28 — double cycle. Full constellation event. WATCH.',
  },
];

const GANTT_AOIS = ['IRAN', 'HORMUZ', 'RED SEA', 'TAIWAN', 'UKR-E', 'UKR-S', 'SCS', 'DPRK', 'SUDAN', 'PAKISTAN'];

function getLevelColor(level: number): string {
  if (level >= 8) return '#FF0040';
  if (level >= 6) return '#FF6B00';
  if (level >= 4) return '#F5A623';
  return '#00FF88';
}

function getConfidenceColor(conf: string): string {
  if (conf === 'HIGH') return '#00FF88';
  if (conf === 'MEDIUM') return '#F5A623';
  return '#FF6B00';
}

export default function PredictionsPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Ticker />
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--color-panel)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="text-lg">🧇</span>
          <h1 className="text-[13px] font-bold text-[var(--color-waffle)] tracking-wide">
            SYRUP METER — PREDICTIONS
          </h1>
        </div>
        <nav className="flex gap-1 text-[11px] font-bold tracking-wider">
          <Link href="/tracker" className="px-3 py-1.5 rounded border border-[var(--color-border-bright)] text-[var(--color-text-dim)] hover:border-[var(--color-waffle)] hover:text-[var(--color-waffle)] hover:bg-[var(--color-waffle)]/5 transition-colors">TRACKER</Link>
          <Link href="/intel" className="px-3 py-1.5 rounded border border-[var(--color-border-bright)] text-[var(--color-text-dim)] hover:border-[var(--color-waffle)] hover:text-[var(--color-waffle)] hover:bg-[var(--color-waffle)]/5 transition-colors">INTEL</Link>
          <Link href="/predictions" className="px-3 py-1.5 rounded border border-[var(--color-waffle)] bg-[var(--color-waffle)]/15 text-[var(--color-waffle)]">PREDICTIONS</Link>
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Gantt Chart */}
        <section className="panel p-6 mb-6">
          <h2 className="panel-header text-[14px]">PREDICTED ALIGNMENT WINDOWS — NEXT 30 DAYS</h2>
          <div className="overflow-x-auto">
            {/* Date header */}
            <div className="flex items-center gap-0 mb-2 text-[8px] text-[var(--color-text-muted)] font-mono ml-[80px]">
              {Array.from({ length: 30 }, (_, i) => {
                const d = new Date(2026, 2, 1 + i);
                return i % 7 === 0 ? (
                  <div key={i} className="flex-1 text-center border-l border-[var(--color-border)] pl-1">
                    Mar {d.getDate()}
                  </div>
                ) : (
                  <div key={i} className="flex-1" />
                );
              })}
            </div>

            {/* AOI rows */}
            {GANTT_AOIS.map((aoi) => (
              <div key={aoi} className="flex items-center h-6 mb-1">
                <div className="w-[80px] text-[9px] text-[var(--color-text-dim)] font-mono flex-shrink-0 truncate pr-2">
                  {aoi}
                </div>
                <div className="flex-1 flex h-full bg-[var(--color-card)] rounded-sm relative">
                  {/* Simulated blocks */}
                  {Array.from({ length: 30 }, (_, day) => {
                    // Random-ish but deterministic blocks based on AOI hash
                    const hash = (aoi.charCodeAt(0) * 31 + day * 7) % 100;
                    const isElevated = hash < 8;
                    const isModerate = hash >= 8 && hash < 20;
                    return (
                      <div
                        key={day}
                        className="flex-1 border-r border-[rgba(255,255,255,0.02)]"
                        style={{
                          backgroundColor: isElevated
                            ? 'rgba(255, 107, 0, 0.4)'
                            : isModerate
                              ? 'rgba(255, 184, 0, 0.15)'
                              : 'transparent',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex gap-4 mt-3 ml-[80px] text-[8px] text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-[rgba(255,107,0,0.4)]" /> Syrup {'>'} 6 (HEAVY POUR+)
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-[rgba(255,184,0,0.15)]" /> Syrup 4-6 (DRIZZLE)
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Windows */}
        <section className="panel p-6">
          <h2 className="panel-header text-[14px]">UPCOMING ALIGNMENT WINDOWS</h2>
          <div className="space-y-4">
            {PREDICTIONS.map((pred, i) => (
              <div
                key={i}
                className="border border-[var(--color-border)] rounded p-4 bg-[var(--color-card)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[var(--color-text)]">
                      {pred.date} {pred.time}
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: getLevelColor(pred.level) }}>
                      — {pred.aoi} — SYRUP {pred.level.toFixed(1)}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded"
                    style={{
                      color: getConfidenceColor(pred.confidence),
                      backgroundColor: getConfidenceColor(pred.confidence) + '15',
                      border: `1px solid ${getConfidenceColor(pred.confidence)}40`,
                    }}
                  >
                    {pred.confidence}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px]">
                  <div>
                    <span className="text-[var(--color-text-muted)]">SATS: </span>
                    <span className="text-[var(--color-text)]">{pred.sats.join(' → ')}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">COVERAGE: </span>
                    <span className="text-[var(--color-text)]">{pred.coverage}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">HOTSPOTS: </span>
                    <span className="text-[var(--color-ok)]">
                      {pred.hotspots.map((h) => `${h} \u2713`).join('  ')}
                    </span>
                  </div>
                  {pred.pattern && (
                    <div>
                      <span className="text-[var(--color-text-muted)]">PATTERN: </span>
                      <span className="text-[var(--color-waffle)]">{pred.pattern}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
