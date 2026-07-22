'use client';

import { useState } from 'react';
import { t, type Locale } from '@/lib/analytics/i18n';

export type DateRangeValue = { preset: '24h' | '7d' | '30d' | '90d' | 'custom'; sinceMs: number; untilMs: number };

type Props = {
  locale: Locale;
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
};

function toInputDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateRangePicker({ locale, value, onChange }: Props) {
  const [customSince, setCustomSince] = useState<string>(toInputDate(value.sinceMs));
  const [customUntil, setCustomUntil] = useState<string>(toInputDate(value.untilMs));

  function choosePreset(preset: '24h' | '7d' | '30d' | '90d') {
    const span: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };
    const until = Date.now();
    onChange({ preset, sinceMs: until - span[preset], untilMs: until });
  }

  function applyCustom() {
    const since = new Date(customSince).getTime();
    const until = new Date(customUntil).getTime();
    if (Number.isFinite(since) && Number.isFinite(until) && until > since) {
      onChange({ preset: 'custom', sinceMs: since, untilMs: until });
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-brand-dark-card border border-brand-dark-border rounded-xl p-4">
      <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold mr-2">
        {t(locale, 'dateRange')}
      </span>
      {(['24h', '7d', '30d', '90d'] as const).map((p) => (
        <button
          key={p}
          onClick={() => choosePreset(p)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            value.preset === p
              ? 'bg-brand-red text-white'
              : 'bg-brand-dark-muted text-gray-300 hover:text-white'
          }`}
        >
          {t(locale, p as any)}
        </button>
      ))}
      <div className="flex flex-wrap items-end gap-2 ml-auto border-l border-brand-dark-border pl-3">
        <button
          onClick={() => onChange({ ...value, preset: 'custom' })}
          className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            value.preset === 'custom'
              ? 'bg-brand-red text-white'
              : 'bg-brand-dark-muted text-gray-300 hover:text-white'
          }`}
        >
          {t(locale, 'custom')}
        </button>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          <span>{t(locale, 'from')}</span>
          <input
            type="datetime-local"
            value={customSince}
            onChange={(e) => setCustomSince(e.target.value)}
            className="bg-brand-dark-muted text-white text-xs rounded px-2 py-1 border border-brand-dark-border focus:outline-none focus:border-brand-red"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          <span>{t(locale, 'to')}</span>
          <input
            type="datetime-local"
            value={customUntil}
            onChange={(e) => setCustomUntil(e.target.value)}
            className="bg-brand-dark-muted text-white text-xs rounded px-2 py-1 border border-brand-dark-border focus:outline-none focus:border-brand-red"
          />
        </label>
        <button
          onClick={applyCustom}
          className="px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-brand-gold text-brand-dark hover:bg-brand-gold-light"
        >
          {t(locale, 'apply')}
        </button>
      </div>
    </div>
  );
}
