'use client';

import { CORRELATION_EVENTS } from '@/lib/events';

interface Props {
  onRewindToEvent?: (time: Date, aoiId: string) => void;
  simulationTime?: Date | null;
}

export function EventTimeline({ onRewindToEvent, simulationTime }: Props) {
  // Show events newest first
  const events = [...CORRELATION_EVENTS].reverse();

  return (
    <div className="panel p-3">
      <div className="panel-header">CORRELATION EVENTS</div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {events.map((event) => {
          const eventDate = new Date(event.date);
          const isActive = simulationTime
            && Math.abs(eventDate.getTime() - simulationTime.getTime()) < 3600_000;
          const dateStr = event.date.slice(0, 10);

          return (
            <div
              key={event.id}
              className="group flex items-start gap-2 text-[11px] cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-[var(--color-card)]"
              style={{
                background: isActive ? `${event.color}10` : 'transparent',
                borderLeft: isActive ? `2px solid ${event.color}` : '2px solid transparent',
              }}
              onClick={() => onRewindToEvent?.(eventDate, event.aoiId)}
              title="Click to rewind to this event"
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: event.color }}
                />
                <div className="w-px h-6 bg-[var(--color-border)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-text-dim)]">{dateStr}</span>
                  <span className="font-bold" style={{ color: event.color }}>
                    {event.unscored ? 'SYRUP N/A' : `SYRUP ${event.level.toFixed(1)}`}
                  </span>
                </div>
                <div className="text-[var(--color-text)] truncate">
                  {event.type === 'CORRELATED' && (
                    <span className="text-[var(--color-danger)] mr-1">{'\u{1F3AF}'}</span>
                  )}
                  {event.label}
                </div>
                <div className="text-[9px] text-[var(--color-text-muted)]">
                  {event.sats.join(', ')}
                </div>
              </div>
              {/* Rewind icon */}
              <div
                className="mt-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  color: isActive ? event.color : 'var(--color-text-muted)',
                  opacity: isActive ? 1 : undefined,
                }}
              >
                {isActive ? '◆' : '⏪'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
