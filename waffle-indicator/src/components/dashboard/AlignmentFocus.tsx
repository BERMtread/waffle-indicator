'use client';

import { type AlignmentFocusData } from '@/hooks/useAlignmentFocus';
import { type AOIData } from '@/lib/geo/aoi-data';
import { formatTimeShort } from '@/lib/utils/time';

interface Props {
  data: AlignmentFocusData;
  onSelectAOI: (aoi: AOIData) => void;
  aois: AOIData[];
}

export function AlignmentFocus({ data, onSelectAOI, aois }: Props) {
  const {
    currentCountry,
    currentCountrySatCount,
    currentPeakAOI,
    nextPeak,
    predictionStale,
  } = data;

  const handleAOIClick = (aoiId: string) => {
    const aoi = aois.find(a => a.id === aoiId);
    if (aoi) onSelectAOI(aoi);
  };

  return (
    <div className="panel p-3">
      {/* Current Alignment Section */}
      <div className="panel-header">CURRENT ALIGNMENT</div>

      {currentCountry ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-dim)]">CLUSTER</span>
            <span className="text-[var(--color-text)] font-bold">
              {currentCountrySatCount} SAT{currentCountrySatCount !== 1 ? 'S' : ''} OVER{' '}
              <span className="text-[var(--color-waffle)]">{currentCountry.toUpperCase()}</span>
            </span>
          </div>

          {currentPeakAOI && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--color-text-dim)]">TOP AOI</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAOIClick(currentPeakAOI.id)}
                  className="text-[var(--color-blue)] hover:underline cursor-pointer"
                >
                  {currentPeakAOI.name}
                </button>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: currentPeakAOI.levelColor }}
                >
                  {currentPeakAOI.waffleLevel.toFixed(1)}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: currentPeakAOI.levelColor }}
                >
                  {currentPeakAOI.levelLabel}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-[12px] text-[var(--color-text-muted)] text-center py-2">
          No country cluster detected
        </div>
      )}

      {/* Next Predicted Peak Section */}
      <div className="panel-header mt-3">NEXT PREDICTED PEAK</div>

      {nextPeak ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-dim)]">AOI</span>
            <button
              onClick={() => handleAOIClick(nextPeak.aoi.id)}
              className="text-[var(--color-blue)] hover:underline cursor-pointer"
            >
              {nextPeak.aoi.name}
            </button>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-dim)]">LEVEL</span>
            <span style={{ color: nextPeak.levelColor }} className="font-bold">
              {nextPeak.waffleLevel.toFixed(1)} {nextPeak.levelLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-dim)]">ETA</span>
            <span className="text-[var(--color-text)]">
              {nextPeak.etaMinutes} MIN
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-dim)]">PEAK</span>
            <span className="text-[var(--color-text)]">
              {formatTimeShort(nextPeak.peakTime)} UTC
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-text-dim)]">SATS</span>
            <span className="text-[var(--color-text)]">
              {nextPeak.satCount} IN FOOTPRINT
            </span>
          </div>
          {predictionStale && (
            <div className="text-[10px] text-[var(--color-text-muted)] text-right">
              UPDATING...
            </div>
          )}
        </div>
      ) : (
        <div className="text-[12px] text-[var(--color-text-muted)] text-center py-2">
          {predictionStale ? 'Computing prediction...' : 'No upcoming peaks in 90 min window'}
        </div>
      )}
    </div>
  );
}
