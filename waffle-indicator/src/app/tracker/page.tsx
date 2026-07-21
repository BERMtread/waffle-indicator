'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initSatellites, type SatRecord } from '@/lib/orbital/propagator';
import { ALL_AOIS, type AOIData } from '@/lib/geo/aoi-data';
import { useOrbitalPropagation } from '@/hooks/useOrbitalPropagation';
import { useWaffleLevel, useAllWaffleLevels } from '@/hooks/useWaffleLevel';
import { Ticker } from '@/components/dashboard/Ticker';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { WaffleLevel } from '@/components/dashboard/WaffleLevel';
import { SatelliteTable } from '@/components/dashboard/SatelliteTable';
import { AOISelector } from '@/components/dashboard/AOISelector';
import { HotspotPanel } from '@/components/dashboard/HotspotPanel';
import { AlignmentFocus } from '@/components/dashboard/AlignmentFocus';
import { EventTimeline } from '@/components/dashboard/EventTimeline';
import { TimelineScrubber } from '@/components/dashboard/TimelineScrubber';
import { useAlignmentFocus } from '@/hooks/useAlignmentFocus';
import { formatTimeShort } from '@/lib/utils/time';
import { staggerPanels } from '@/lib/animations';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const GlobeView = dynamic(
  () => import('@/components/map/GlobeView').then(m => ({ default: m.GlobeView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-[10px] font-mono">
        INITIALIZING GLOBE...
      </div>
    ),
  }
);

export default function TrackerPage() {
  const [satellites, setSatellites] = useState<SatRecord[]>([]);
  const [selectedAOI, setSelectedAOI] = useState<AOIData | null>(null);
  const [focusSat, setFocusSat] = useState<{ satId: string; nonce: number } | null>(null);
  const [utcTime, setUtcTime] = useState('');
  const [tleAge, setTleAge] = useState('LOADING...');

  // --- Time machine state ---
  const [simulationTime, setSimulationTime] = useState<Date | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(60);

  // Track which date we last fetched historical TLEs for (YYYY-MM-DD)
  const lastTleDateRef = useRef<string | null>(null);

  // Load live TLEs from Space-Track on mount
  useEffect(() => {
    fetch('/api/tle')
      .then(r => r.json())
      .then(data => {
        setSatellites(initSatellites(data.tles));
        setTleAge(data.source === 'fallback' ? 'FALLBACK' : 'LIVE');
      })
      .catch(() => {
        setSatellites(initSatellites());
        setTleAge('FALLBACK');
      });
    // Default to Iran (primary AOI)
    const iran = ALL_AOIS.find(a => a.id === 'iran');
    if (iran) setSelectedAOI(iran);
  }, []);

  // Fetch historical TLEs from Space-Track when simulation date changes
  useEffect(() => {
    if (!simulationTime) {
      // Returned to live — re-fetch current TLEs if we were in history mode
      if (lastTleDateRef.current !== null) {
        lastTleDateRef.current = null;
        fetch('/api/tle')
          .then(r => r.json())
          .then(data => {
            setSatellites(initSatellites(data.tles));
            setTleAge(data.source === 'fallback' ? 'FALLBACK' : 'LIVE');
          })
          .catch(() => {});
      }
      return;
    }

    // Only re-fetch when the calendar date changes (not every second of playback)
    const dateStr = simulationTime.toISOString().slice(0, 10);
    if (dateStr === lastTleDateRef.current) return;
    lastTleDateRef.current = dateStr;

    setTleAge('LOADING...');
    fetch(`/api/tle/history?date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        setSatellites(initSatellites(data.tles));
        setTleAge(`HIST:${dateStr}`);
      })
      .catch(() => {
        setTleAge('FALLBACK');
      });
  }, [simulationTime]);

  // UTC clock
  useEffect(() => {
    const interval = setInterval(() => {
      if (simulationTime) {
        setUtcTime(formatTimeShort(simulationTime));
      } else {
        setUtcTime(formatTimeShort(new Date()));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [simulationTime]);

  // Playback: advance simulation time when playing
  useEffect(() => {
    if (!isPlaying || !simulationTime) return;
    const interval = setInterval(() => {
      setSimulationTime(prev => {
        if (!prev) return null;
        const next = new Date(prev.getTime() + 1000 * playbackSpeed);
        if (next.getTime() >= Date.now()) {
          setIsPlaying(false);
          return null;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, simulationTime]);

  // Real-time propagation (with simulation time support)
  const { positions, trails, predictedPaths } = useOrbitalPropagation(satellites, 1000, simulationTime);

  // Coverage for selected AOI
  const coverage = useWaffleLevel(positions, selectedAOI);

  // Coverage for all AOIs (for selector badges)
  const allCoverage = useAllWaffleLevels(positions, ALL_AOIS);

  // Alignment focus intelligence
  const alignmentFocus = useAlignmentFocus(allCoverage, ALL_AOIS, satellites, positions);

  // Handle rewind to event
  const handleRewindToEvent = useCallback((time: Date, aoiId: string) => {
    setSimulationTime(time);
    setIsPlaying(false);
    const aoi = ALL_AOIS.find(a => a.id === aoiId);
    if (aoi) setSelectedAOI(aoi);
  }, []);

  // Handle time change from scrubber
  const handleTimeChange = useCallback((time: Date | null) => {
    setSimulationTime(time);
    if (time === null) setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const isLive = simulationTime === null;

  // Panel entrance animation
  useEffect(() => {
    const anim = staggerPanels('.panel', 60);
    return () => { anim.pause(); };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Ticker */}
      <Ticker />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--color-panel)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <span className="text-lg">🧇</span>
          <div>
            <h1 className="text-[13px] font-bold text-[var(--color-waffle)] tracking-wide">
              SYRUP METER
            </h1>
            <div className="text-[9px] text-[var(--color-text-muted)]">
              $ASTS v2.0 — REAL SGP4 — {positions.length} SATS TRACKED
              {!isLive && (
                <span className="text-[var(--color-waffle)] ml-2 font-bold">⏪ REWIND MODE</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-1 text-[11px] font-bold tracking-wider">
            <Link href="/tracker" className="px-3 py-1.5 rounded border border-[var(--color-waffle)] bg-[var(--color-waffle)]/15 text-[var(--color-waffle)]">
              TRACKER
            </Link>
            <Link href="/intel" className="px-3 py-1.5 rounded border border-[var(--color-border-bright)] text-[var(--color-text-dim)] hover:border-[var(--color-waffle)] hover:text-[var(--color-waffle)] hover:bg-[var(--color-waffle)]/5 transition-colors">
              INTEL
            </Link>
            <Link href="/predictions" className="px-3 py-1.5 rounded border border-[var(--color-border-bright)] text-[var(--color-text-dim)] hover:border-[var(--color-waffle)] hover:text-[var(--color-waffle)] hover:bg-[var(--color-waffle)]/5 transition-colors">
              PREDICTIONS
            </Link>
          </nav>
          <div className="text-right">
            <div className="text-[11px] text-[var(--color-text)] font-bold tabular-nums">
              {isLive ? 'UTC' : 'SIM'} {utcTime}
            </div>
            <div className="text-[8px] text-[var(--color-text-muted)]">
              TLE: {tleAge}
            </div>
          </div>
        </div>
      </header>

      {/* Timeline Scrubber */}
      <TimelineScrubber
        simulationTime={simulationTime}
        onTimeChange={handleTimeChange}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
      />

      {/* Stats Row */}
      <StatsRow positions={positions} coverage={coverage} tleAge={tleAge} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Map + Table */}
        <div className="flex-1 flex flex-col p-3 gap-3 overflow-hidden">
          {/* AOI Selector */}
          <div className="panel p-2">
            <AOISelector
              aois={ALL_AOIS}
              selectedAOI={selectedAOI}
              onSelect={setSelectedAOI}
              coverageMap={allCoverage}
            />
          </div>

          {/* Globe */}
          <div className="panel flex-1 min-h-[400px] overflow-hidden">
            <GlobeView
              focusSat={focusSat}
              positions={positions}
              trails={trails}
              predictedPaths={predictedPaths}
              aois={ALL_AOIS}
              selectedAOI={selectedAOI}
              onSelectAOI={setSelectedAOI}
            />
          </div>

          {/* Satellite Table */}
          <SatelliteTable
            positions={positions}
            coverage={coverage}
            selectedSatId={focusSat?.satId ?? null}
            onSelectSat={(satId) => setFocusSat((f) => ({ satId, nonce: (f?.nonce ?? 0) + 1 }))}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] flex flex-col gap-3 p-3 pl-0 overflow-y-auto">
          <WaffleLevel
            coverage={coverage}
            aoiName={selectedAOI?.name ?? ''}
          />
          <HotspotPanel coverage={coverage} />
          <AlignmentFocus
            data={alignmentFocus}
            onSelectAOI={setSelectedAOI}
            aois={ALL_AOIS}
          />
          <EventTimeline
            onRewindToEvent={handleRewindToEvent}
            simulationTime={simulationTime}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-1.5 bg-[var(--color-panel)] border-t border-[var(--color-border)] text-[8px] text-[var(--color-text-muted)]">
        <span>🍯 NOT FINANCIAL ADVICE — EDUCATIONAL / OSINT TOOL</span>
        <span>$ASTS 🛰 SYRUP METER — SPACE-TRACK.ORG — POLYGON COVERAGE ENGINE</span>
      </footer>
    </div>
  );
            }
