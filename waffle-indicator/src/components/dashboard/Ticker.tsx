'use client';

import { CORRELATION_EVENTS } from '@/lib/events';

// The ticker is generated from the live event data so it never drifts out of
// sync with the tracker again. v4 = critical-moment / best-pass methodology.

function tierColor(level: number, unscored?: boolean): string {
  if (unscored) return 'var(--color-text-muted)';
  if (level >= 8) return 'var(--color-danger)';
  if (level >= 5) return 'var(--color-warn)';
  if (level >= 2) return 'var(--color-waffle)';
  return 'var(--color-ok)';
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .toUpperCase();
}

type Item = { text: string; color: string };

function buildItems(): Item[] {
  const ev = CORRELATION_EVENTS;
  const mainOps = ev.filter((e) => !e.parentOp);
  const breaks = ev.filter((e) => e.id.startsWith('ef-cb') || e.id.startsWith('ef-ceasefire'));
  const topBreak = breaks.reduce<(typeof breaks)[number] | null>(
    (best, e) => (best === null || e.level > best.level ? e : best),
    null,
  );

  const items: Item[] = [
    { text: 'SYRUP METER — 10 ASTS WAFFLES TRACKED', color: 'var(--color-waffle)' },
    { text: 'BW3 · BB1–BB6 · BB8–BB10 — TWO ORBITAL PLANES (~45° APART)', color: 'var(--color-ok)' },
    { text: 'v4 CRITICAL-MOMENT MODEL — SYRUP = 10·sin(BEST-PASS ELEVATION)', color: 'var(--color-blue)' },
    { text: 'PIZZA INDEX IS LAGGING — SYRUP IS (ALLEGEDLY) LEADING', color: 'var(--color-warn)' },
  ];

  for (const e of mainOps) {
    items.push({
      text: `${fmtDate(e.date)}: ${e.label.toUpperCase()} — SYRUP ${e.level.toFixed(1)}`,
      color: tierColor(e.level, e.unscored),
    });
  }

  if (breaks.length > 0) {
    items.push({
      text: `${breaks.length} EPIC FURY CEASEFIRE-BREAK STRIKES TRACKED (STRAIT OF HORMUZ)`,
      color: 'var(--color-waffle)',
    });
  }
  if (topBreak) {
    items.push({
      text: `PEAK CEASEFIRE BREAK — ${fmtDate(topBreak.date)} — SYRUP ${topBreak.level.toFixed(1)}`,
      color: tierColor(topBreak.level),
    });
  }

  items.push(
    { text: `${ev.length} CORRELATION EVENTS · SGP4 FROM REAL SPACE-TRACK TLEs`, color: 'var(--color-text)' },
    { text: 'ORBITAL-MECHANICS CURIOSITY — NOT INTELLIGENCE', color: 'var(--color-text-dim)' },
    { text: '$ASTS — AST SPACEMOBILE — NOT FINANCIAL ADVICE', color: 'var(--color-text-dim)' },
  );
  return items;
}

export function Ticker() {
  const base = buildItems();
  const items = [...base, ...base]; // double for seamless scroll
  return (
    <div className="w-full overflow-hidden bg-[var(--color-panel)] border-b border-[var(--color-border)] h-7 flex items-center">
      <div className="ticker-animate flex whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="mx-6 text-[11px] font-mono tracking-wide">
            <span style={{ color: item.color }}>{item.text}</span>
            <span className="mx-4 text-[var(--color-text-muted)]">{'●'}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
