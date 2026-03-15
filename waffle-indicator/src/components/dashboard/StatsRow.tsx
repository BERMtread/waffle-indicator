'use client';

import { type SatPosition } from '@/lib/orbital/propagator';
import { type AOICoverage } from '@/lib/orbital/alignment-scorer';

interface Props {
  positions: SatPosition[];
  coverage: AOICoverage | null;
  tleAge: string;
}

export function StatsRow({ positions, coverage, tleAge }: Props) {
  const stats = [
    {
      label: 'SATS',
      value: `${coverage?.satsInFootprint.length ?? 0}/${positions.length}`,
      color: 'var(--color-blue)',
    },
    {
      label: 'COV',
      value: coverage?.satsInFootprint.length ? `~${(coverage.satsInFootprint.length * 8)}m` : '0m',
      color: 'var(--color-ok)',
    },
    {
      label: 'CYCLE',
      value: '13d',
      color: 'var(--color-waffle)',
    },
    {
      label: 'P',
      value: '<1%',
      color: 'var(--color-danger)',
    },
    {
      label: 'SYRUP',
      value: coverage ? coverage.waffleLevel.toFixed(1) : '0.0',
      color: coverage?.levelColor ?? 'var(--color-ok)',
    },
    {
      label: 'TLE',
      value: tleAge,
      color: 'var(--color-text-dim)',
    },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-card)] border-b border-[var(--color-border)] overflow-x-auto">
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-1 text-[11px] font-mono whitespace-nowrap">
          <span className="text-[var(--color-text-muted)] bg-[var(--color-panel)] px-1.5 py-0.5 rounded-sm border border-[var(--color-border)]">
            [{s.label}:<span className="font-bold" style={{ color: s.color }}>{s.value}</span>]
          </span>
        </div>
      ))}
    </div>
  );
}
