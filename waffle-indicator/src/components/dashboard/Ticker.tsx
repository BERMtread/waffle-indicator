'use client';

const TICKER_ITEMS = [
  { text: 'SYRUP: TRACKING 7 ASTS SATS', color: 'var(--color-waffle)' },
  { text: 'BW3 = OG WAFFLE (64m² ARRAY)', color: 'var(--color-waffle)' },
  { text: 'BB6 = BLOCK 2 (223m² MEGA SYRUP)', color: 'var(--color-ok)' },
  { text: 'PIZZA INDEX IS A LAGGING INDICATOR', color: 'var(--color-danger)' },
  { text: 'RIP PIZZA -- SYRUP IS LEADING', color: 'var(--color-warn)' },
  { text: '55 AOIS MONITORED GLOBALLY', color: 'var(--color-blue)' },
  { text: 'FEB 28 2026: OP EPIC FURY -- IRAN -- SYRUP 9.8 DROWNING IN SYRUP', color: 'var(--color-danger)' },
  { text: 'DEC 29 2025: PLA JUSTICE MISSION -- TAIWAN -- SYRUP 8.1', color: 'var(--color-danger)' },
  { text: 'JUN 13 2025: OP RISING LION -- ISRAEL STRIKES IRAN -- SYRUP 9.2', color: 'var(--color-danger)' },
  { text: 'MAY 7 2025: OP SINDOOR -- INDIA-PAKISTAN -- SYRUP 7.0', color: 'var(--color-warn)' },
  { text: '9 CONFIRMED CORRELATIONS ACROSS 6 REGIONS', color: 'var(--color-waffle)' },
  { text: 'P(RANDOM COINCIDENCE) < 0.1%', color: 'var(--color-danger)' },
  { text: 'SGP4 PROPAGATION -- REAL ORBITAL MECHANICS', color: 'var(--color-text)' },
  { text: '$ASTS -- SPACE MOBILE -- NOT FINANCIAL ADVICE', color: 'var(--color-text-dim)' },
];

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // double for seamless scroll
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
