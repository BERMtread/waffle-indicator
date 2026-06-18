'use client';

import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { CORRELATION_EVENTS, TIMELINE_START } from '@/lib/events';

const SPEEDS = [1, 60, 600, 3600];
const SPEED_LABELS = ['1x', '60x', '10m/s', '1h/s'];

interface Props {
  simulationTime: Date | null;
  onTimeChange: (time: Date | null) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

function formatUTC(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
}

function formatShortDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
}

function parseUTCInput(raw: string): Date | null {
  const s = raw.trim().replace(' ', 'T');
  const withZ = s.endsWith('Z') ? s : s + 'Z';
  const d = new Date(withZ);
  return isNaN(d.getTime()) ? null : d;
}

export function TimelineScrubber({
  simulationTime,
  onTimeChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLive = simulationTime === null;

  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [inputError, setInputError] = useState(false);

  const timelineEnd = useMemo(() => new Date(), []);
  const timelineStart = TIMELINE_START;
  const totalMs = timelineEnd.getTime() - timelineStart.getTime();

  useEffect(() => {
    if (!isEditing) {
      setInputValue(simulationTime ? formatUTC(simulationTime) : '');
      setInputError(false);
    }
  }, [simulationTime, isEditing]);

  const submitInput = useCallback(() => {
    setIsEditing(false);
    if (!inputValue.trim()) {
      onTimeChange(null);
      return;
    }
    const parsed = parseUTCInput(inputValue);
    if (!parsed) {
      setInputError(true);
      setTimeout(() => {
        setInputValue(simulationTime ? formatUTC(simulationTime) : '');
        setInputError(false);
      }, 1200);
      return;
    }
    setInputError(false);
    const clamped = new Date(
      Math.max(timelineStart.getTime(), Math.min(timelineEnd.getTime(), parsed.getTime()))
    );
    onTimeChange(clamped);
  }, [inputValue, simulationTime, onTimeChange, timelineStart, timelineEnd]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitInput();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(simulationTime ? formatUTC(simulationTime) : '');
      setInputError(false);
      inputRef.current?.blur();
    }
  }, [submitInput, simulationTime]);

  const timeToPercent = useCallback((d: Date) => {
    return Math.max(0, Math.min(100, ((d.getTime() - timelineStart.getTime()) / totalMs) * 100));
  }, [timelineStart, totalMs]);

  const percentToTime = useCallback((pct: number) => {
    const ms = timelineStart.getTime() + (pct / 100) * totalMs;
    return new Date(Math.max(timelineStart.getTime(), Math.min(timelineEnd.getTime(), ms)));
  }, [timelineStart, timelineEnd, totalMs]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    onTimeChange(percentToTime(pct));
  }, [percentToTime, onTimeChange]);

  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!trackRef.current) return;
    e.preventDefault();
    const moveHandler = (me: MouseEvent) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pct = ((me.clientX - rect.left) / rect.width) * 100;
      onTimeChange(percentToTime(pct));
    };
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  }, [percentToTime, onTimeChange]);

  const playheadPct = simulationTime ? timeToPercent(simulationTime) : 100;

  const activeEvent = simulationTime
    ? CORRELATION_EVENTS.reduce((closest, ev) => {
        const evTime = new Date(ev.date).getTime();
        const simTime = simulationTime.getTime();
        const prevDist = closest ? Math.abs(new Date(closest.date).getTime() - simTime) : Infinity;
        return Math.abs(evTime - simTime) < prevDist ? ev : closest;
      }, null as typeof CORRELATION_EVENTS[number] | null)
    : null;

  const isNearEvent = activeEvent && simulationTime
    ? Math.abs(new Date(activeEvent.date).getTime() - simulationTime.getTime()) < 3600_000
    : false;

  const monthMarkers = useMemo(() => {
    const markers: { label: string; pct: number }[] = [];
    const d = new Date(timelineStart);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    if (d < timelineStart) d.setUTCMonth(d.getUTCMonth() + 1);
    while (d <= timelineEnd) {
      markers.push({ label: formatShortDate(d), pct: timeToPercent(d) });
      d.setUTCMonth(d.getUTCMonth() + 2);
    }
    return markers;
  }, [timelineStart, timelineEnd, timeToPercent]);

  return (
    <div className="bg-[var(--color-panel)] border-b border-[var(--color-border)] px-4 py-1.5">
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isLive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[var(--color-ok)] animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-[var(--color-ok)] tracking-wider shrink-0">LIVE</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="YYYY-MM-DD HH:MM:SSZ  — type to rewind"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setIsEditing(true); }}
                onFocus={() => setIsEditing(true)}
                onBlur={submitInput}
                onKeyDown={handleInputKeyDown}
                className="flex-1 min-w-0 bg-transparent border border-[var(--color-border)] rounded px-2 py-0 text-[10px] font-mono text-[var(--color-text-muted)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-waffle)] focus:text-[var(--color-text)] transition-colors"
                style={{ height: '20px', maxWidth: '280px' }}
              />
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold text-[var(--color-waffle)] tracking-wider shrink-0">
                ⏪ REWIND
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setIsEditing(true); setInputError(false); }}
                onFocus={() => setIsEditing(true)}
                onBlur={submitInput}
                onKeyDown={handleInputKeyDown}
                className="min-w-0 bg-transparent border rounded px-2 py-0 text-[10px] font-mono tabular-nums focus:outline-none transition-colors"
                style={{
                  height: '20px',
                  width: '192px',
                  borderColor: inputError
                    ? 'var(--color-danger)'
                    : isEditing
                      ? 'var(--color-waffle)'
                      : 'var(--color-border-bright)',
                  color: inputError ? 'var(--color-danger)' : 'var(--color-text)',
                }}
                title="Type a UTC date/time and press Enter (e.g. 2026-02-28 06:15:00Z)"
              />
              {inputError && (
                <span className="text-[9px] text-[var(--color-danger)] shrink-0">INVALID DATE</span>
              )}
              {!inputError && isNearEvent && activeEvent && (
                <span className="text-[9px] font-bold truncate shrink-0" style={{ color: activeEvent.color }}>
                  {activeEvent.shortLabel}
                </span>
              )}
              {!inputError && !isNearEvent && (
                <span className="text-[8px] text-[var(--color-text-muted)] shrink-0">\u21b5 to jump</span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isLive && (
            <>
              <button
                onClick={onPlayPause}
                className="px-2 py-0.5 text-[9px] font-bold tracking-wider border rounded transition-colors"
                style={{
                  borderColor: isPlaying ? 'var(--color-waffle)' : 'var(--color-border-bright)',
                  color: isPlaying ? 'var(--color-waffle)' : 'var(--color-text-dim)',
                  background: isPlaying ? 'rgba(255,184,0,0.1)' : 'transparent',
                }}
              >
                {isPlaying ? '\u23f8 PAUSE' : '\u25b6 PLAY'}
              </button>
              <div className="flex gap-0.5">
                {SPEEDS.map((spd, i) => (
                  <button
                    key={spd}
                    onClick={() => onSpeedChange(spd)}
                    className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider border rounded transition-colors"
                    style={{
                      borderColor: playbackSpeed === spd ? 'var(--color-blue)' : 'var(--color-border)',
                      color: playbackSpeed === spd ? 'var(--color-blue)' : 'var(--color-text-muted)',
                      background: playbackSpeed === spd ? 'rgba(68,136,255,0.1)' : 'transparent',
                    }}
                  >
                    {SPEED_LABELS[i]}
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => onTimeChange(null)}
            className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider border rounded transition-all"
            style={{
              borderColor: isLive ? 'var(--color-ok)' : 'var(--color-border-bright)',
              color: isLive ? 'var(--color-ok)' : 'var(--color-text-muted)',
              background: isLive ? 'rgba(0,255,136,0.1)' : 'transparent',
              boxShadow: isLive ? '0 0 8px rgba(0,255,136,0.2)' : 'none',
            }}
          >
            \u25cf LIVE
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative h-[22px] cursor-crosshair select-none"
        onClick={handleTrackClick}
        onMouseDown={handleDrag}
      >
        <div className="absolute top-[10px] left-0 right-0 h-px bg-[var(--color-border-bright)]" />

        {monthMarkers.map((m, i) => (
          <div key={i} className="absolute top-[6px]" style={{ left: `${m.pct}%` }}>
            <div className="w-px h-[8px] bg-[var(--color-border-bright)]" />
            <div className="text-[7px] text-[var(--color-text-muted)] mt-0.5 -translate-x-1/2 whitespace-nowrap">
              {m.label}
            </div>
          </div>
        ))}

        {CORRELATION_EVENTS.map(ev => {
          const pct = timeToPercent(new Date(ev.date));
          const isActive = isNearEvent && activeEvent?.id === ev.id;
          return (
            <div
              key={ev.id}
              className="absolute top-[7px] -translate-x-1/2 z-10"
              style={{ left: `${pct}%` }}
              title={`${ev.label} — SYRUP ${ev.level}`}
            >
              <div
                className="w-[7px] h-[7px] rounded-full border transition-transform"
                style={{
                  backgroundColor: ev.color,
                  borderColor: isActive ? '#fff' : ev.color,
                  transform: isActive ? 'scale(1.6)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 8px ${ev.color}` : 'none',
                }}
              />
            </div>
          );
        })}

        <div
          className="absolute top-0 -translate-x-1/2 z-20 pointer-events-none"
          style={{ left: `${playheadPct}%` }}
        >
          <div
            className="w-0 h-0 mx-auto"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: isLive ? '6px solid var(--color-ok)' : '6px solid var(--color-waffle)',
            }}
          />
          <div
            className="w-px h-[16px] mx-auto"
            style={{
              background: isLive ? 'var(--color-ok)' : 'var(--color-waffle)',
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </div>
  );
        }
