'use client';

import { useState, useMemo } from 'react';
import { type AOIData, type PriorityTier } from '@/lib/geo/aoi-data';
import { type AOICoverage } from '@/lib/orbital/alignment-scorer';

interface Props {
  aois: AOIData[];
  selectedAOI: AOIData | null;
  onSelect: (aoi: AOIData) => void;
  coverageMap: Map<string, AOICoverage>;
}

const TIER_LABELS: Record<number, string> = {
  1: 'CRITICAL',
  2: 'STRATEGIC',
  3: 'ELEVATED',
  4: 'WATCH',
};

const REGIONS = [
  'All',
  'Middle East',
  'East Asia',
  'Europe',
  'South Asia',
  'Indo-Pacific',
  'Africa',
  'Southeast Asia',
  'South America',
  'Pacific',
  'Caribbean',
  'Arctic',
];

export function AOISelector({ aois, selectedAOI, onSelect, coverageMap }: Props) {
  const [tierFilter, setTierFilter] = useState<PriorityTier | 0>(0);
  const [regionFilter, setRegionFilter] = useState('All');

  const filtered = useMemo(() => {
    return aois.filter(a => {
      if (tierFilter && a.priority !== tierFilter) return false;
      if (regionFilter !== 'All' && a.region !== regionFilter) return false;
      return true;
    });
  }, [aois, tierFilter, regionFilter]);

  const handleAOIChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aoi = aois.find(a => a.id === e.target.value);
    if (aoi) onSelect(aoi);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1 rounded-sm text-[11px] font-mono"
        value={tierFilter}
        onChange={(e) => setTierFilter(Number(e.target.value) as PriorityTier | 0)}
      >
        <option value={0}>ALL TIERS</option>
        <option value={1}>TIER 1: CRITICAL</option>
        <option value={2}>TIER 2: STRATEGIC</option>
        <option value={3}>TIER 3: ELEVATED</option>
        <option value={4}>TIER 4: WATCH</option>
      </select>
      <select
        className="bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1 rounded-sm text-[11px] font-mono"
        value={regionFilter}
        onChange={(e) => setRegionFilter(e.target.value)}
      >
        {REGIONS.map(r => (
          <option key={r} value={r}>{r.toUpperCase()}</option>
        ))}
      </select>
      <select
        className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1 rounded-sm text-[11px] font-mono"
        value={selectedAOI?.id ?? ''}
        onChange={handleAOIChange}
      >
        <option value="" disabled>SELECT AOI</option>
        {filtered.map(aoi => {
          const cov = coverageMap.get(aoi.id);
          const levelTag = cov && cov.waffleLevel > 0
            ? ` [${cov.waffleLevel.toFixed(1)} ${cov.levelLabel}]`
            : '';
          return (
            <option key={aoi.id} value={aoi.id}>
              P{aoi.priority} {aoi.displayName || aoi.name}{levelTag}
            </option>
          );
        })}
      </select>
    </div>
  );
}
