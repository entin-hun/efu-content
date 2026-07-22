"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

const SESSION_DISMISS_KEY = "mma-lost-timer-dismissed";
const LOST_END_TIMESTAMP_MS = Date.parse("2026-07-17T15:00:00+02:00");

type Props = {
  endTimestampMs?: number;
  oncePerSession?: boolean;
};

type SlotState = {
  current: number;
  previous: number;
  changedAt: number;
};

export default function LostTimerModal({
  endTimestampMs = LOST_END_TIMESTAMP_MS,
  oncePerSession = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [systemFailure, setSystemFailure] = useState(false);
  const slotStates = useRef<SlotState[]>(
    Array.from({ length: 5 }, () => ({
      current: 0,
      previous: 0,
      changedAt: 0,
    })),
  );

  useEffect(() => {
    if (oncePerSession) {
      try {
        if (window.sessionStorage.getItem(SESSION_DISMISS_KEY) === "1") {
          setDismissed(true);
        }
      } catch {
        // Ignore storage errors in private mode.
      }
    }
    setMounted(true);
  }, [oncePerSession]);

  useEffect(() => {
    if (!mounted || dismissed) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [mounted, dismissed]);

  const remainingMs =
    now == null ? Math.max(0, endTimestampMs - Date.now()) : Math.max(0, endTimestampMs - now);
  const showSeconds = remainingMs < 4 * 60 * 60 * 1000;

  const digits = useMemo<number[]>(() => {
    if (showSeconds) {
      const totalSec = Math.floor(remainingMs / 1000);
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor((totalSec % 3600) / 60);
      const ss = totalSec % 60;
      return [Math.floor(hh / 10) % 10, hh % 10, Math.floor(mm / 10), Math.floor(ss / 10), ss % 10];
    }

    const totalMin = Math.floor(remainingMs / 60000);
    const dd = Math.min(99, Math.floor(totalMin / (24 * 60)));
    const hh = Math.floor((totalMin % (24 * 60)) / 60);
    const mm = totalMin % 60;
    return [Math.floor(dd / 10) % 10, dd % 10, hh % 10, Math.floor(mm / 10), mm % 10];
  }, [remainingMs, showSeconds]);

  useEffect(() => {
    if (now == null) return;
    const states = slotStates.current;
    for (let i = 0; i < digits.length; i += 1) {
      const cur = digits[i];
      if (states[i].current !== cur) {
        states[i] = {
          previous: states[i].current,
          current: cur,
          changedAt: now,
        };
      }
    }
    if (remainingMs === 0 && !systemFailure) {
      setSystemFailure(true);
    }
  }, [digits, now, remainingMs, systemFailure]);

  const close = () => {
    if (oncePerSession) {
      try {
        window.sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
      } catch {
        // Ignore storage write failures.
      }
    }
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  const slotBg = (i: number) => (i < 3 ? "black" : "white");
  const slotFg = (i: number) => (i < 3 ? "white" : "black");

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Countdown timer"
        className="fixed inset-0 z-[81] flex items-center justify-center pointer-events-none p-4"
      >
        <div
          className={`w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden ${
            systemFailure ? "animate-pulse" : ""
          }`}
          style={{ background: systemFailure ? "#ad363c" : "#181818" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-6 flex items-center justify-center gap-1">
            <div className="flex">
              {digits.slice(0, 3).map((digit, i) => (
                <FlipperSlot
                  key={`L${i}`}
                  state={slotStates.current[i]}
                  digit={digit}
                  bg={slotBg(i)}
                  fg={slotFg(i)}
                />
              ))}
            </div>
            <div className="text-white text-3xl font-bold px-1 select-none">:</div>
            <div className="flex">
              {digits.slice(3, 5).map((digit, i) => (
                <FlipperSlot
                  key={`R${i + 3}`}
                  state={slotStates.current[i + 3]}
                  digit={digit}
                  bg={slotBg(i + 3)}
                  fg={slotFg(i + 3)}
                />
              ))}
            </div>
          </div>

          <div className="px-6 pb-5 text-center">
            <button
              onClick={close}
              aria-label="Dismiss for this session"
              title="Dismiss for this session"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
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
  bg: "black" | "white";
  fg: "white" | "black";
}) {
  const isFlipping = state.changedAt > 0 && state.previous !== state.current;

  return (
    <div
      className="relative w-12 h-16 mx-0.5 rounded-sm overflow-hidden"
      style={{
        background: bg === "black" ? "#000" : "#b1b1b1",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1/2 flex items-end justify-center overflow-hidden"
        style={{
          color: fg,
          background: bg === "black" ? "#000" : "#b1b1b1",
        }}
      >
        <span
          className="text-3xl font-extrabold leading-none"
          style={{
            transform: "translateY(50%)",
            fontFamily: "Helvetica, system-ui, sans-serif",
          }}
        >
          {isFlipping ? state.previous : state.current}
        </span>
      </div>

      <div className="absolute inset-x-0 top-1/2 h-[2px]" style={{ background: "#000", transform: "translateY(-1px)" }} />

      <div
        className="absolute inset-x-0 bottom-0 h-1/2 flex items-start justify-center overflow-hidden"
        style={{
          color: fg,
          background: bg === "black" ? "#383839" : "#ebebeb",
        }}
      >
        <span
          className="text-3xl font-extrabold leading-none"
          style={{
            transform: "translateY(-50%)",
            fontFamily: "Helvetica, system-ui, sans-serif",
          }}
        >
          {digit}
        </span>
      </div>

      {isFlipping && <div className="absolute inset-0 pointer-events-none flipper-anim" />}

      <style jsx>{`
        @keyframes lost-flip {
          0% {
            transform: rotateX(0deg);
            opacity: 1;
          }
          100% {
            transform: rotateX(180deg);
            opacity: 0;
          }
        }
        .flipper-anim {
          animation: lost-flip 0.4s linear forwards;
        }
      `}</style>
    </div>
  );
}