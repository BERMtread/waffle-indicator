'use client';

import { type AOICoverage } from '@/lib/orbital/alignment-scorer';
import { useSyrupAnimation } from '@/hooks/useSyrupAnimation';

interface Props {
  coverage: AOICoverage | null;
  aoiName: string;
}

export function WaffleLevel({ coverage, aoiName }: Props) {
  const level = coverage?.waffleLevel ?? 0;
  const label = coverage?.levelLabel ?? 'DRY WAFFLE';
  const color = coverage?.levelColor ?? '#00FF88';
  const pct = Math.min(100, (level / 10) * 100);
  const isCritical = level >= 8;

  const { numberRef, barRef, panelRef } = useSyrupAnimation(level, pct);

  return (
    <div ref={panelRef} className={`panel p-4${isCritical ? ' syrup-glow' : ''}`}>
      <div className="panel-header">SYRUP METER</div>

      <div className="text-center mb-3">
        <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
          {aoiName || 'NO AOI SELECTED'}
        </div>
        <div ref={numberRef} className="text-[42px] font-bold leading-none" style={{ color }}>
          {level.toFixed(1)}
        </div>
        <div
          className={`text-[11px] font-bold tracking-[0.2em] mt-1 ${isCritical ? 'blink-critical' : ''}`}
          style={{ color }}
        >
          {label}
        </div>
      </div>

      {/* Bar gauge */}
      <div className="w-full h-3 bg-[var(--color-card)] rounded-sm overflow-hidden border border-[var(--color-border)]">
        <div
          ref={barRef}
          className="h-full rounded-sm"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>

      {/* Scale */}
      <div className="flex justify-between mt-1 text-[9px] text-[var(--color-text-muted)]">
        <span>0</span>
        <span>DRY</span>
        <span>DRIZZLE</span>
        <span>POUR</span>
        <span>DROWNING</span>
        <span>10</span>
      </div>

      {/* Stats */}
      {coverage && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[var(--color-text-muted)]">SATS IN FP: </span>
            <span className="font-bold" style={{ color }}>{coverage.satsInFootprint.length}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">APPROACHING: </span>
            <span className="text-[var(--color-text)]">{coverage.satsApproaching.length}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">HOTSPOTS: </span>
            <span className="text-[var(--color-waffle)]">{coverage.hotspotsInView.length}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">RAW: </span>
            <span className="text-[var(--color-text)]">{(coverage.waffleLevel).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
