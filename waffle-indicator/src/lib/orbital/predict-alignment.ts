import { type SatRecord, getAllPositions } from './propagator';
import { type AOIData } from '@/lib/geo/aoi-data';
import { computeWaffleLevel, type AOICoverage } from './alignment-scorer';

export interface PeakPrediction {
  aoi: AOIData;
  waffleLevel: number;
  levelLabel: string;
  levelColor: string;
  satCount: number;
  peakTime: Date;
  etaMinutes: number;
}

const STEP_MINUTES = 5;
const HORIZON_MINUTES = 90;

/**
 * Propagate satellites forward in 5-min steps for 90 minutes.
 * Score all active AOIs at each step and return the single best upcoming peak.
 */
export function predictNextPeak(
  satellites: SatRecord[],
  aois: AOIData[],
  now?: Date
): PeakPrediction | null {
  const baseTime = now ?? new Date();
  const targetAOIs = aois.filter(a => a.active);

  if (satellites.length === 0 || targetAOIs.length === 0) return null;

  let best: PeakPrediction | null = null;

  for (let m = STEP_MINUTES; m <= HORIZON_MINUTES; m += STEP_MINUTES) {
    const futureTime = new Date(baseTime.getTime() + m * 60_000);
    const futurePositions = getAllPositions(satellites, futureTime);

    for (const aoi of targetAOIs) {
      const cov: AOICoverage = computeWaffleLevel(futurePositions, aoi);

      if (cov.waffleLevel > (best?.waffleLevel ?? 0)) {
        best = {
          aoi,
          waffleLevel: cov.waffleLevel,
          levelLabel: cov.levelLabel,
          levelColor: cov.levelColor,
          satCount: cov.satsInFootprint.length,
          peakTime: futureTime,
          etaMinutes: m,
        };
      }
    }
  }

  return best;
}
