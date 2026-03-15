import { type SatPosition } from './propagator';
import { satelliteCoversAOI, getHotspotsInFootprint, type SimpleAOI, type CoverageResult } from '../geo/coverage-check';
import { getElevationMultiplier, HOTSPOT_BONUS, getSyrupLevel } from './constants';

export interface AOICoverage {
  aoiId: string;
  waffleLevel: number;
  levelLabel: string;
  levelColor: string;
  satsInFootprint: {
    satId: string;
    name: string;
    codename: string;
    coverage: CoverageResult;
    elevMultiplier: number;
    contribution: number;
  }[];
  satsApproaching: {
    satId: string;
    name: string;
    codename: string;
    distanceKm: number;
    etaMinutes: number | null;
  }[];
  hotspotsInView: {
    name: string;
    type: string;
    elevDeg: number;
    coveredBy: string[];
  }[];
}

export function computeWaffleLevel(
  positions: SatPosition[],
  aoi: SimpleAOI
): AOICoverage {
  const satsInFootprint: AOICoverage['satsInFootprint'] = [];
  const satsApproaching: AOICoverage['satsApproaching'] = [];
  const hotspotsMap = new Map<string, { name: string; type: string; elevDeg: number; coveredBy: string[] }>();

  let rawScore = 0;

  for (const pos of positions) {
    const coverage = satelliteCoversAOI(pos.lat, pos.lng, pos.alt, aoi);

    if (coverage.covers) {
      const elevMult = getElevationMultiplier(coverage.bestElevationDeg);

      // Check hotspots
      let hotspotBonus = 0;
      if (aoi.hotspots) {
        const inFP = getHotspotsInFootprint(pos.lat, pos.lng, pos.alt, aoi.hotspots);
        for (const h of inFP) {
          const bonus = HOTSPOT_BONUS[h.type] || HOTSPOT_BONUS.default;
          hotspotBonus = Math.max(hotspotBonus, bonus);

          const existing = hotspotsMap.get(h.name);
          if (existing) {
            existing.coveredBy.push(pos.codename);
            existing.elevDeg = Math.max(existing.elevDeg, h.elevDeg);
          } else {
            hotspotsMap.set(h.name, {
              name: h.name,
              type: h.type,
              elevDeg: h.elevDeg,
              coveredBy: [pos.codename],
            });
          }
        }
      }

      const contribution = pos.weight * elevMult * (1 + hotspotBonus);
      rawScore += contribution;

      satsInFootprint.push({
        satId: pos.satId,
        name: pos.name,
        codename: pos.codename,
        coverage,
        elevMultiplier: elevMult,
        contribution,
      });
    } else if (coverage.minDistanceKm < Infinity && coverage.minDistanceKm < 3000) {
      // Approaching — within 3000km
      const approachContribution = pos.weight * 0.3 * getElevationMultiplier(coverage.bestElevationDeg);
      rawScore += approachContribution;

      // Rough ETA based on ~7.5 km/s ground speed
      const eta = coverage.minDistanceKm > 0 ? coverage.minDistanceKm / (7.5 * 60) : null;

      satsApproaching.push({
        satId: pos.satId,
        name: pos.name,
        codename: pos.codename,
        distanceKm: coverage.minDistanceKm,
        etaMinutes: eta ? Math.round(eta) : null,
      });
    }
  }

  const waffleLevel = Math.min(10, rawScore);

  const syrupInfo = getSyrupLevel(waffleLevel);
  const levelLabel = syrupInfo.label;
  const levelColor = syrupInfo.color;

  return {
    aoiId: aoi.id,
    waffleLevel,
    levelLabel,
    levelColor,
    satsInFootprint,
    satsApproaching,
    hotspotsInView: Array.from(hotspotsMap.values()),
  };
}
