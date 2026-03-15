'use client';

export function Terminal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-mono text-[11px] leading-relaxed text-[var(--color-text)] ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
      {children}
    </span>
  );
}

export function Value({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="text-lg font-bold" style={{ color: color || 'var(--color-text)' }}>
      {children}
    </span>
  );
}
