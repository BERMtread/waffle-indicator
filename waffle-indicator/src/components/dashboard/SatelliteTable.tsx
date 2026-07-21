'use client';

import { type SatPosition } from '@/lib/orbital/propagator';
import { type AOICoverage } from '@/lib/orbital/alignment-scorer';
import { formatCoord, formatAltitude, formatDistance } from '@/lib/utils/format';
import { SATELLITES } from '@/lib/orbital/constants';

const UNFURL_NOTE = new Map(SATELLITES.filter((m) => m.unfurlNote).map((m) => [m.id, m.unfurlNote as string]));

interface Props {
  positions: SatPosition[];
  coverage: AOICoverage | null;
  selectedSatId?: string | null;
  onSelectSat?: (satId: string) => void;
}

export function SatelliteTable({ positions, coverage, selectedSatId, onSelectSat }: Props) {
  const inFP = new Set(coverage?.satsInFootprint.map(s => s.satId) ?? []);
  const approachMap = new Map(coverage?.satsApproaching.map(s => [s.satId, s]) ?? []);
  const fpMap = new Map(coverage?.satsInFootprint.map(s => [s.satId, s]) ?? []);

  return (
    <div className="panel p-3 overflow-hidden">
      <div className="panel-header">CONSTELLATION STATUS</div>
      <div className="overflow-auto max-h-[240px]">
        <table className="w-full text-[11px] font-mono">
          <thead className="sticky top-0 z-10 bg-[var(--color-panel)]">
            <tr className="text-[var(--color-text-muted)] text-[9px] uppercase tracking-wider">
              <th className="text-left pb-2 pr-2">SAT</th>
              <th className="text-left pb-2 pr-2">CODE</th>
              <th className="text-right pb-2 pr-2">LAT</th>
              <th className="text-right pb-2 pr-2">LNG</th>
              <th className="text-right pb-2 pr-2">ALT</th>
              <th className="text-right pb-2 pr-2">DIST</th>
              <th className="text-left pb-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const isInFP = inFP.has(pos.satId);
              const approaching = approachMap.get(pos.satId);
              const fpData = fpMap.get(pos.satId);
              const dist = fpData
                ? fpData.coverage.minDistanceKm
                : approaching
                  ? approaching.distanceKm
                  : null;

              let status: string;
              let statusColor: string;
              if (isInFP) {
                status = 'IN FOOTPRINT';
                statusColor = 'var(--color-ok)';
              } else if (approaching) {
                status = `APPROACH ~${approaching.etaMinutes ?? '?'}m`;
                statusColor = 'var(--color-waffle)';
              } else {
                status = 'OUT OF RANGE';
                statusColor = 'var(--color-text-muted)';
              }

              return (
                <tr
                  key={pos.satId}
                  onClick={() => onSelectSat?.(pos.satId)}
                  className={`border-t border-[var(--color-border)] cursor-pointer transition-colors ${
                    pos.satId === selectedSatId
                      ? 'bg-[var(--color-waffle)]/15'
                      : 'hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <td className="py-1.5 pr-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: pos.color }}
                    />
                    {pos.satId.toUpperCase()}
                  </td>
                  <td className="py-1.5 pr-2 text-[var(--color-text-dim)]">
                    {pos.codename}
                    {UNFURL_NOTE.has(pos.satId) && (
                      <div className="text-[8px] text-[var(--color-warn)] not-italic leading-tight mt-0.5">
                        ⚠ {UNFURL_NOTE.get(pos.satId)}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 pr-2 text-right">{formatCoord(pos.lat, 'lat')}</td>
                  <td className="py-1.5 pr-2 text-right">{formatCoord(pos.lng, 'lng')}</td>
                  <td className="py-1.5 pr-2 text-right text-[var(--color-text-dim)]">
                    {formatAltitude(pos.alt)}
                  </td>
                  <td className="py-1.5 pr-2 text-right">
                    {dist !== null ? formatDistance(dist) : '—'}
                  </td>
                  <td className="py-1.5">
                    <span className="text-[9px] font-bold" style={{ color: statusColor }}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
