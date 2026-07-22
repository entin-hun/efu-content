'use client';

import { useEffect, useState } from 'react';
import { t, type Locale } from '@/lib/analytics/i18n';

type RealtimeData = {
  streamId: string;
  concurrent: number;
  chatRate: number;
  voteRate: number;
};

type Props = {
  locale: Locale;
  streams: string[];
  pollMs?: number;
};

export function RealtimePanel({ locale, streams, pollMs = 4000 }: Props) {
  const initial = streams[0] ?? 'fight_night_jul17';
  const [selected, setSelected] = useState(initial);
  const [snapshot, setSnapshot] = useState<RealtimeData | null>(null);
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJoining(true);
    let sessionId = `dash-${Math.random().toString(36).slice(2, 12)}`;

    async function beat() {
      try {
        const res = await fetch('/api/analytics/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId: selected, sessionId, action: 'join' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as RealtimeData;
        setSnapshot(data);
        setError(null);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
    }

    beat();
    const id = setInterval(beat, pollMs);
    return () => {
      clearInterval(id);
      // best-effort leave
      void fetch('/api/analytics/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: selected, sessionId, action: 'leave' }),
      });
      setJoining(false);
    };
  }, [selected, pollMs]);

  return (
    <section className="bg-brand-dark-card border border-brand-dark-border rounded-2xl p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-red animate-pulse" />
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">
            {t(locale, 'realtime')}
          </h2>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-brand-dark-muted text-white text-xs rounded px-2 py-1 border border-brand-dark-border focus:outline-none focus:border-brand-red"
        >
          {streams.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </header>
      {error && (
        <p className="text-xs text-brand-red mb-2">realtime error: {error}</p>
      )}
      <div className="grid grid-cols-3 gap-4">
        <Tile
          label={t(locale, 'realtime_concurrent')}
          value={snapshot?.concurrent ?? 0}
          active={joining}
        />
        <Tile label={t(locale, 'realtime_chat')} value={snapshot?.chatRate ?? 0} />
        <Tile label={t(locale, 'realtime_vote')} value={snapshot?.voteRate ?? 0} />
      </div>
    </section>
  );
}

function Tile({ label, value, active }: { label: string; value: number; active?: boolean }) {
  return (
    <div className="bg-brand-dark-muted rounded-xl p-4 border border-brand-dark-border">
      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{label}</p>
      <p className="text-3xl font-black text-white tabular-nums mt-1">
        {value.toLocaleString('hu-HU')}
      </p>
      {active && <p className="text-xs text-brand-red mt-1 uppercase tracking-widest">live pulse</p>}
    </div>
  );
}
