'use client';

import { type AOICoverage } from '@/lib/orbital/alignment-scorer';

interface Props {
  coverage: AOICoverage | null;
}

const TYPE_ICONS: Record<string, string> = {
  nuclear: '\u269B',     // atom
  military: '\u2694',    // swords
  command: '\u2691',     // flag
  naval: '\u2693',       // anchor
  airbase: '\u2708',     // plane
  launch: '\u26A1',      // lightning
  infrastructure: '\u2699', // gear
  chokepoint: '\u26D4',  // no entry
  default: '\u25C6',     // diamond
};

const TYPE_COLORS: Record<string, string> = {
  nuclear: '#FF0040',
  military: '#FF6B00',
  command: '#FFB800',
  naval: '#4488FF',
  airbase: '#4488FF',
  launch: '#FF6B00',
  infrastructure: '#00FF88',
  chokepoint: '#FF0040',
};

export function HotspotPanel({ coverage }: Props) {
  const hotspots = coverage?.hotspotsInView ?? [];

  return (
    <div className="panel p-3">
      <div className="panel-header">HOTSPOTS IN VIEW</div>
      {hotspots.length === 0 ? (
        <div className="text-[11px] text-[var(--color-text-muted)] text-center py-4">
          No hotspots in satellite footprint
        </div>
      ) : (
        <div className="space-y-1.5">
          {hotspots.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span style={{ color: TYPE_COLORS[h.type] || '#888' }}>
                  {TYPE_ICONS[h.type] || TYPE_ICONS.default}
                </span>
                <span className="text-[var(--color-text)]">{h.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-dim)]">{h.elevDeg.toFixed(1)}&deg; el</span>
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase">
                  {h.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
