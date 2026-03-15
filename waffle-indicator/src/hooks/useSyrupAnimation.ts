'use client';

import { useRef, useEffect } from 'react';
import { animateValue, animateBar } from '@/lib/animations';

export function useSyrupAnimation(level: number, pct: number) {
  const numberRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevLevelRef = useRef(level);
  const prevPctRef = useRef(pct);

  useEffect(() => {
    if (!numberRef.current) return;
    const from = prevLevelRef.current;
    if (from === level) return;
    const anim = animateValue(numberRef.current, from, level, 800, 1);
    prevLevelRef.current = level;
    return () => { anim.pause(); };
  }, [level]);

  useEffect(() => {
    if (!barRef.current) return;
    const from = prevPctRef.current;
    if (from === pct) return;
    const anim = animateBar(barRef.current, pct, 700);
    prevPctRef.current = pct;
    return () => { anim.pause(); };
  }, [pct]);

  return { numberRef, barRef, panelRef };
}
