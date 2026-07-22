'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Lost-stílusú countdown komponens a hero szekcióhoz.
 * A LostTimerModal vizuális esztétikáját követi, de nem modal, hanem beágyazott.
 * Cél: Budapesti idő szerint 2026. augusztus 3., 10:00 (CEST → UTC 08:00).
 */

type Props = {
  targetDate: Date;
};

type SlotState = {
  current: number;
  previous: number;
  changedAt: number;
};

export function LostTimerCountdown({ targetDate }: Props) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const slotStates = useRef<SlotState[]>(
    Array.from({ length: 5 }, () => ({
      current: 0,
      previous: 0,
      changedAt: 0,
    }))
  );

  // Mount guard + 1 Hz tick
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const end = targetDate.getTime();
  const remainingMs = now == null ? 0 : Math.max(0, end - now);

  // 4 óra alatt HH:MM:SS mód
  const showSeconds = remainingMs < 4 * 60 * 60 * 1000;

  // Számjegyek: 5 slot
  const digits = useMemo<number[]>(() => {
    if (showSeconds) {
      const totalSec = Math.floor(remainingMs / 1000);
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor((totalSec % 3600) / 60);
      const ss = totalSec % 60;
      return [
        Math.floor(hh / 10) % 10,
        hh % 10,
        Math.floor(mm / 10),
        Math.floor(ss / 10),
        ss % 10,
      ];
    }
    const totalMin = Math.floor(remainingMs / 60000);
    const dd = Math.min(99, Math.floor(totalMin / (24 * 60)));
    const hh = Math.floor((totalMin % (24 * 60)) / 60);
    const mm = totalMin % 60;
    return [
      Math.floor(dd / 10) % 10,
      dd % 10,
      hh % 10,
      Math.floor(mm / 10),
      mm % 10,
    ];
  }, [remainingMs, showSeconds]);

  // Flip animáció indítása
  useEffect(() => {
    if (now == null) return;
    const states = slotStates.current;
    for (let i = 0; i < digits.length; i++) {
      const cur = digits[i];
      if (states[i].current !== cur) {
        states[i] = {
          previous: states[i].current,
          current: cur,
          changedAt: now,
        };
      }
    }
  }, [digits, now]);

  // Slot színek: 1-3 fekete háttér + fehér szám, 4-5 fehér háttér + fekete szám
  const slotBg = (i: number) => (i < 3 ? 'black' : 'white');
  const slotFg = (i: number) => (i < 3 ? 'white' : 'black');

  // Hydration guard: szerver oldalon és első kliens render előtt üres placeholder
  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
          Kezdésig hátralévő idő
        </p>
        <div className="flex items-center justify-center gap-1">
          <div className="flex">
            {[0, 0, 0].map((_, i) => (
              <div key={`L${i}`} className="w-12 h-16 mx-0.5 rounded-sm" style={{ background: '#000' }} />
            ))}
          </div>
          <div className="text-white text-3xl font-bold px-1 select-none">:</div>
          <div className="flex">
            {[0, 0].map((_, i) => (
              <div key={`R${i + 3}`} className="w-12 h-16 mx-0.5 rounded-sm" style={{ background: '#b1b1b1' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
        {showSeconds ? 'Hátralévő idő' : 'Kezdésig hátralévő idő'}
      </p>
      
      {/* The flipper display */}
      <div className="flex items-center justify-center gap-1">
        <div className="flex">
          {digits.slice(0, 3).map((d, i) => (
            <FlipperSlot
              key={`L${i}`}
              state={slotStates.current[i]}
              digit={d}
              bg={slotBg(i)}
              fg={slotFg(i)}
            />
          ))}
        </div>
        <div className="text-white text-3xl font-bold px-1 select-none">:</div>
        <div className="flex">
          {digits.slice(3, 5).map((d, i) => (
            <FlipperSlot
              key={`R${i + 3}`}
              state={slotStates.current[i + 3]}
              digit={d}
              bg={slotBg(i + 3)}
              fg={slotFg(i + 3)}
            />
          ))}
        </div>
      </div>

      {/* Slot labels */}
      <div className="flex items-center justify-center gap-1">
        <div className="flex">
          {digits.slice(0, 3).map((_, i) => (
            <div
              key={`LL${i}`}
              className="w-12 text-center text-[10px] text-gray-500 font-mono uppercase"
            >
              {showSeconds ? ['óra', 'óra', 'perc'][i] : ['nap', 'nap', 'óra'][i]}
            </div>
          ))}
        </div>
        <div className="w-3" />
        <div className="flex">
          {digits.slice(3, 5).map((_, i) => (
            <div
              key={`LR${i + 3}`}
              className="w-12 text-center text-[10px] text-gray-500 font-mono uppercase"
            >
              {['perc', 'perc'][i]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlipperSlot({
  state,
  digit,
  bg,
  fg,
}: {
  state: SlotState;
  digit: number;
  bg: 'black' | 'white';
  fg: 'white' | 'black';
}) {
  const isFlipping = state.changedAt > 0 && state.previous !== state.current;
  
  return (
    <div
      className="relative w-12 h-16 mx-0.5 rounded-sm overflow-hidden"
      style={{
        background: bg === 'black' ? '#000' : '#b1b1b1',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top half */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 flex items-end justify-center overflow-hidden"
        style={{
          color: fg,
          background: bg === 'black' ? '#000' : '#b1b1b1',
        }}
      >
        <span
          className="text-3xl font-extrabold leading-none"
          style={{
            transform: 'translateY(50%)',
            fontFamily: 'Helvetica, system-ui, sans-serif',
          }}
        >
          {isFlipping ? state.previous : state.current}
        </span>
      </div>
      
      {/* Center bar */}
      <div
        className="absolute inset-x-0 top-1/2 h-[2px]"
        style={{ background: '#000', transform: 'translateY(-1px)' }}
      />
      
      {/* Bottom half */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 flex items-start justify-center overflow-hidden"
        style={{
          color: fg,
          background: bg === 'black' ? '#383839' : '#ebebeb',
        }}
      >
        <span
          className="text-3xl font-extrabold leading-none"
          style={{
            transform: 'translateY(-50%)',
            fontFamily: 'Helvetica, system-ui, sans-serif',
          }}
        >
          {state.current}
        </span>
      </div>
      
      {/* Flip overlay during animation */}
      {isFlipping && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            animation: 'lost-flip 0.4s linear forwards'
          }}
        />
      )}
    </div>
  );
}
