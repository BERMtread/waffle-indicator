'use client';

import { useState, useEffect, useRef } from 'react';
import { type SatRecord, type SatPosition, getAllPositions, getGroundTrack } from '@/lib/orbital/propagator';
import { applyEventOverrides } from '@/lib/orbital/event-overrides';

const PREDICTED_DURATION_MIN = 90;  // 90-minute forward prediction
const PREDICTED_STEP_MIN = 1;       // 1-minute resolution
const PREDICTED_REFRESH_MS = 10_000; // Recompute predicted paths every 10s

export type PredictedPath = { satId: string; color: string; points: { lat: number; lng: number }[] };

export function useOrbitalPropagation(
  satellites: SatRecord[],
  intervalMs: number = 1000,
  simulationTime: Date | null = null
) {
  const [positions, setPositions] = useState<SatPosition[]>([]);
  const [trails, setTrails] = useState<Map<string, { lat: number; lng: number }[]>>(new Map());
  const [predictedPaths, setPredictedPaths] = useState<PredictedPath[]>([]);
  const trailsRef = useRef(trails);
  trailsRef.current = trails;

  // Keep simulation time in a ref so the RAF loop always reads the latest
  const simTimeRef = useRef(simulationTime);
  simTimeRef.current = simulationTime;

  // Clear trails when simulation time jumps significantly or returns to live
  const prevSimTimeMs = useRef<number | null>(simulationTime?.getTime() ?? null);
  useEffect(() => {
    const curMs = simulationTime?.getTime() ?? null;
    const prevMs = prevSimTimeMs.current;
    const jumped = (curMs !== null && prevMs !== null && Math.abs(curMs - prevMs) > 120_000)
      || (curMs === null && prevMs !== null)
      || (curMs !== null && prevMs === null);
    if (jumped) {
      setTrails(new Map());
      trailsRef.current = new Map();
    }
    prevSimTimeMs.current = curMs;
  }, [simulationTime]);

  useEffect(() => {
    if (satellites.length === 0) return;

    let lastUpdate = 0;
    let lastPredictedUpdate = 0;
    let frameId: number;

    const loop = (timestamp: number) => {
      if (timestamp - lastUpdate >= intervalMs) {
        const now = simTimeRef.current || new Date();

        // Filter out satellites not yet launched at simulation time
        const activeSats = simTimeRef.current
          ? satellites.filter(s => new Date(s.meta.launched) <= simTimeRef.current!)
          : satellites;

        const rawPositions = getAllPositions(activeSats, now);
        const newPositions = applyEventOverrides(rawPositions, simTimeRef.current);
        setPositions(newPositions);

        // Update trails (keep last 60 points)
        const newTrails = new Map(trailsRef.current);
        for (const pos of newPositions) {
          const trail = newTrails.get(pos.satId) || [];
          trail.push({ lat: pos.lat, lng: pos.lng });
          if (trail.length > 60) trail.shift();
          newTrails.set(pos.satId, trail);
        }
        setTrails(newTrails);
        trailsRef.current = newTrails;

        // Compute predicted paths (forward ground tracks) every 10s
        if (timestamp - lastPredictedUpdate >= PREDICTED_REFRESH_MS) {
          const paths: PredictedPath[] = activeSats.map(sat => {
            const track = getGroundTrack(sat, now, PREDICTED_DURATION_MIN, PREDICTED_STEP_MIN);
            return {
              satId: sat.meta.id,
              color: sat.meta.color,
              points: track.map(p => ({ lat: p.lat, lng: p.lng })),
            };
          });
          setPredictedPaths(paths);
          lastPredictedUpdate = timestamp;
        }

        lastUpdate = timestamp;
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [satellites, intervalMs]);

  return { positions, trails, predictedPaths };
}
