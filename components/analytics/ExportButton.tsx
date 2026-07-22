'use client';

import { useState } from 'react';
import { t, type Locale } from '@/lib/analytics/i18n';
import type { DateRangeValue } from './DateRangePicker';

type Props = {
  locale: Locale;
  range: DateRangeValue;
};

export function ExportButton({ locale, range }: Props) {
  const [working, setWorking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  function exportCsv() {
    setWorking(true);
    setLastError(null);
    const params = new URLSearchParams();
    params.set('range', range.preset === 'custom' ? 'custom' : range.preset);
    params.set('since', String(range.sinceMs));
    params.set('until', String(range.untilMs));
    fetch(`/api/analytics/export.csv?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${t(locale, 'export_filename_prefix')}_${range.sinceMs}_${range.untilMs}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((err) => setLastError(String(err)))
      .finally(() => setWorking(false));
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={exportCsv}
        disabled={working}
        className="px-4 py-2 bg-brand-gold text-brand-dark rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-brand-gold-light disabled:opacity-50 transition-colors"
      >
        {working ? t(locale, 'refreshing') : `⬇ ${t(locale, 'exportCsv')}`}
      </button>
      {lastError && <span className="text-xs text-brand-red">{lastError}</span>}
    </div>
  );
}
