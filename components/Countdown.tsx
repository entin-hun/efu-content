'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Renders ONLY the digits for a single countdown unit. No label, no header —
 * the user explicitly asked for digits only on the black background.
 */
function CountdownDigit({ value }: { value: number }) {
  return (
    <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 card-dark flex items-center justify-center rounded-xl border border-brand-dark-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 to-transparent" />
      <span
        className="text-3xl sm:text-4xl md:text-5xl font-black text-white relative z-10 tabular-nums"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        {String(value).padStart(2, '0')}
      </span>
    </div>
  );
}

/**
 * Renders the four countdown digits with the colon separators. No surrounding
 * text — header text ("Kezdésig hátralévő idő") and unit labels (Nap / Óra /
 * Perc / Mp) are intentionally hidden per the L2-HERO update request.
 */
function CountdownDigits({ timeLeft }: { timeLeft: TimeLeft }) {
  return (
    <div className="flex items-end gap-2 sm:gap-4">
      <CountdownDigit value={timeLeft.days} />
      <span className="text-brand-red text-3xl font-black mb-4">:</span>
      <CountdownDigit value={timeLeft.hours} />
      <span className="text-brand-red text-3xl font-black mb-4">:</span>
      <CountdownDigit value={timeLeft.minutes} />
      <span className="text-brand-red text-3xl font-black mb-4">:</span>
      <CountdownDigit value={timeLeft.seconds} />
    </div>
  );
}

/**
 * 3 → 2 → 1 → GO intro that plays on mount before the real countdown takes
 * over. Each beat scales in, holds briefly, then exits before the next beat.
 * On the final GO beat we signal the parent to begin the live countdown.
 */
const INTRO_BEATS: ReadonlyArray<{ value: string; isGo?: boolean }> = [
  { value: '3' },
  { value: '2' },
  { value: '1' },
  { value: 'GO', isGo: true },
];

function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (beatIndex >= INTRO_BEATS.length) {
      onDone();
      return;
    }

    // Hold the current beat briefly, then exit before the next one enters.
    const exitTimer = setTimeout(() => setVisible(false), 600);
    const advanceTimer = setTimeout(() => {
      setBeatIndex((i) => i + 1);
      setVisible(true);
    }, 850);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(advanceTimer);
    };
  }, [beatIndex, onDone]);

  if (beatIndex >= INTRO_BEATS.length) return null;

  const beat = INTRO_BEATS[beatIndex];

  return (
    <div
      aria-live="polite"
      aria-label="Countdown starting"
      className="w-32 sm:w-40 md:w-48 h-32 sm:h-40 md:h-48 flex items-center justify-center"
    >
      <span
        key={`${beatIndex}-${visible}`}
        className={`text-7xl sm:text-8xl md:text-9xl font-black ${
          beat.isGo ? 'text-brand-gold' : 'text-white'
        } ${visible ? 'animate-efu-mark' : 'opacity-0'}`}
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          textShadow: beat.isGo
            ? '0 0 30px rgba(245,158,11,0.6)'
            : '0 0 20px rgba(220,38,38,0.4)',
        }}
      >
        {beat.value}
      </span>
    </div>
  );
}

export function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));
  const [introDone, setIntroDone] = useState(false);

  const isPast =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  useEffect(() => {
    if (!introDone) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, introDone]);

  if (isPast) {
    return (
      <div className="flex items-center gap-3 px-6 py-3 bg-brand-red/20 border border-brand-red/40 rounded-full">
        <div className="w-3 h-3 rounded-full bg-brand-red animate-pulse" />
        <span className="text-brand-red font-bold uppercase tracking-wider">MOST ÉLŐ</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {!introDone ? (
        <IntroAnimation onDone={() => setIntroDone(true)} />
      ) : (
        <CountdownDigits timeLeft={timeLeft} />
      )}
    </div>
  );
}