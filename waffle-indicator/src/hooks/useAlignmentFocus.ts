'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { type SatPosition, type SatRecord } from '@/lib/orbital/propagator';
import { type AOIData } from '@/lib/geo/aoi-data';
import { type AOICoverage } from '@/lib/orbital/alignment-scorer';
import { getCountryAtPointSync, primeCountryCache } from '@/lib/geo/country-lookup';
import { predictNextPeak, type PeakPrediction } from '@/lib/orbital/predict-alignment';

export interface AlignmentFocusData {
  currentCountry: string | null;
  currentCountrySatCount: number;
  satellitesByCountry: Map<string, number>;
  currentPeakAOI: { name: string; id: string; waffleLevel: number; levelLabel: string; levelColor: string } | null;
  nextPeak: PeakPrediction | null;
  predictionStale: boolean;
}

const PREDICTION_INTERVAL_MS = 30_000;

export function useAlignmentFocus(
  allCoverage: Map<string, AOICoverage>,
  aois: AOIData[],
  satellites: SatRecord[],
  positions: SatPosition[],
): AlignmentFocusData {
  const [nextPeak, setNextPeak] = useState<PeakPrediction | null>(null);
  const [predictionStale, setPredictionStale] = useState(true);
  const lastPredictionTime = useRef<number>(0);

  // Prime country polygon cache on mount
  useEffect(() => {
    primeCountryCache();
  }, []);

  // Current alignment: which country has the most satellites
  const { currentCountry, currentCountrySatCount, satellitesByCountry } = useMemo(() => {
    const byCountry = new Map<string, number>();
    for (const pos of positions) {
      const country = getCountryAtPointSync(pos.lat, pos.lng);
      if (country) {
        byCountry.set(country, (byCountry.get(country) ?? 0) + 1);
      }
    }

    let topCountry: string | null = null;
    let topCount = 0;
    for (const [name, count] of byCountry) {
      if (count > topCount) {
        topCountry = name;
        topCount = count;
      }
    }

    return {
      currentCountry: topCountry,
      currentCountrySatCount: topCount,
      satellitesByCountry: byCountry,
    };
  }, [positions]);

  // Current peak AOI: highest waffle level among all AOIs
  const currentPeakAOI = useMemo(() => {
    let best: AlignmentFocusData['currentPeakAOI'] = null;
    let bestLevel = 0;

    for (const [aoiId, cov] of allCoverage) {
      if (cov.waffleLevel > bestLevel) {
        bestLevel = cov.waffleLevel;
        const aoi = aois.find(a => a.id === aoiId);
        if (aoi) {
          best = {
            name: aoi.name,
            id: aoi.id,
            waffleLevel: cov.waffleLevel,
            levelLabel: cov.levelLabel,
            levelColor: cov.levelColor,
          };
        }
      }
    }

    // Only show if waffle > 0
    return best && best.waffleLevel > 0 ? best : null;
  }, [allCoverage, aois]);

  // Forward prediction — runs every 30s in background
  useEffect(() => {
    if (satellites.length === 0) return;

    const runPrediction = () => {
      const now = Date.now();
      if (now - lastPredictionTime.current < PREDICTION_INTERVAL_MS) return;
      lastPredictionTime.current = now;
      setPredictionStale(true);

      // Run in a timeout to avoid blocking render
      setTimeout(() => {
        const peak = predictNextPeak(satellites, aois);
        setNextPeak(peak);
        setPredictionStale(false);
      }, 0);
    };

    // Initial run
    runPrediction();

    const interval = setInterval(runPrediction, PREDICTION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [satellites, aois]);

  return {
    currentCountry,
    currentCountrySatCount,
    satellitesByCountry,
    currentPeakAOI,
    nextPeak,
    predictionStale,
  };
}
