'use client';

import { useMemo } from 'react';
import { type SatPosition } from '@/lib/orbital/propagator';
import { computeWaffleLevel, type AOICoverage } from '@/lib/orbital/alignment-scorer';
import { type AOIData } from '@/lib/geo/aoi-data';

export function useWaffleLevel(
  positions: SatPosition[],
  selectedAOI: AOIData | null
): AOICoverage | null {
  return useMemo(() => {
    if (!selectedAOI || positions.length === 0) return null;
    return computeWaffleLevel(positions, selectedAOI);
  }, [positions, selectedAOI]);
}

export function useAllWaffleLevels(
  positions: SatPosition[],
  aois: AOIData[]
): Map<string, AOICoverage> {
  return useMemo(() => {
    const map = new Map<string, AOICoverage>();
    if (positions.length === 0) return map;
    for (const aoi of aois) {
      map.set(aoi.id, computeWaffleLevel(positions, aoi));
    }
    return map;
  }, [positions, aois]);
}
