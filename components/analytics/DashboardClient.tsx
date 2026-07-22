'use client';

import { useCallback, useEffect, useState } from 'react';
import { DateRangePicker, type DateRangeValue } from './DateRangePicker';
import { ExportButton } from './ExportButton';
import { RealtimePanel } from './RealtimePanel';
import { VisitorsCard } from './VisitorsCard';
import { ActivityCard } from './ActivityCard';
import { SubscriptionsCard } from './SubscriptionsCard';
import { ViewershipCard } from './ViewershipCard';
import { VotesCard } from './VotesCard';
import { InteractionsCard } from './InteractionsCard';
import type { AnalyticsSummary } from '@/lib/analytics/aggregate';
import { LOCALE_NAMES, SUPPORTED_LOCALES, t, type Locale } from '@/lib/analytics/i18n';

const STREAMS = ['fight_night_jul17', 'reality_zone_a', 'fight_night_main'];

type Props = {
  initialLocale: Locale;
  initialSummary: AnalyticsSummary;
};

export function DashboardClient({ initialLocale, initialSummary }: Props) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [summary, setSummary] = useState<AnalyticsSummary>(initialSummary);
  const [range, setRange] = useState<DateRangeValue>(() => ({
    preset: '7d',
    sinceMs: initialSummary.range.sinceMs,
    untilMs: initialSummary.range.untilMs,
  }));
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [hasData, setHasData] = useState(initialSummary.visitors.pageViews > 0);

  const refresh = useCallback(
    async (override?: { showMsg?: boolean }) => {
      setRefreshing(true);
      if (override?.showMsg) setRefreshMessage(t(locale, 'refreshing'));
      try {
        const params = new URLSearchParams();
        params.set('range', range.preset === 'custom' ? 'custom' : range.preset);
        params.set('since', String(range.sinceMs));
        params.set('until', String(range.untilMs));
        const res = await fetch(`/api/analytics/summary?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AnalyticsSummary;
        setSummary(data);
        setHasData(data.visitors.pageViews > 0);
        setRefreshMessage(null);
      } catch (e: any) {
        setRefreshMessage(`error: ${e?.message ?? e}`);
      } finally {
        setRefreshing(false);
      }
    },
    [locale, range],
  );

  // Re-fetch when range or locale changes (locale affects labels but data is language-agnostic;
  // we still re-render but a fetch only matters when range changes)
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.preset, range.sinceMs, range.untilMs]);

  async function seed() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/analytics/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: any) {
      setRefreshMessage(`seed error: ${e?.message ?? e}`);
    } finally {
      setRefreshing(false);
    }
  }

  async function reset() {
    if (typeof window !== 'undefined' && !window.confirm(t(locale, 'confirm_reset'))) {
      return;
    }
    setRefreshing(true);
    try {
      const res = await fetch('/api/analytics/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: any) {
      setRefreshMessage(`reset error: ${e?.message ?? e}`);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-dark text-white pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              EFU <span className="text-brand-red">Analytics</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              {t(locale, 'subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-widest text-gray-500">Locale</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="bg-brand-dark-muted text-white text-xs rounded px-2 py-1 border border-brand-dark-border focus:outline-none focus:border-brand-red"
            >
              {SUPPORTED_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {LOCALE_NAMES[code]} ({code})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <DateRangePicker locale={locale} value={range} onChange={setRange} />
          </div>
          <button
            onClick={() => refresh({ showMsg: true })}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-dark-muted text-white hover:text-brand-gold disabled:opacity-50"
          >
            {refreshing ? t(locale, 'refreshing') : t(locale, 'refreshNow')}
          </button>
          <ExportButton locale={locale} range={range} />
          <button
            onClick={seed}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-red text-white hover:bg-brand-red-dark disabled:opacity-50"
          >
            {t(locale, 'seed_demo_data')}
          </button>
          <button
            onClick={reset}
            disabled={refreshing}
            className="px-3 py-2 rounded-lg text-xs uppercase tracking-wider text-gray-500 hover:text-brand-red"
          >
            {t(locale, 'reset')}
          </button>
        </div>

        {refreshMessage && (
          <p className="text-xs text-brand-gold">{refreshMessage}</p>
        )}

        {!hasData && (
          <div className="bg-brand-dark-card border border-brand-gold/50 rounded-2xl p-4 text-sm text-gray-300">
            {t(locale, 'no_events_yet')}
          </div>
        )}

        <RealtimePanel locale={locale} streams={STREAMS} />

        {/* Metric grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VisitorsCard locale={locale} data={summary.visitors} />
          <ActivityCard locale={locale} data={summary.activity} />
          <SubscriptionsCard locale={locale} data={summary.subscriptions} />
          <ViewershipCard locale={locale} data={summary.viewership} />
          <VotesCard locale={locale} data={summary.votes} />
          <InteractionsCard locale={locale} data={summary.interactions} />
        </div>
      </div>
    </main>
  );
}
