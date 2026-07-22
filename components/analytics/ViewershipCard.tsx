'use client';

import { t, type Locale } from '@/lib/analytics/i18n';
import { StatCard } from './StatCard';
import type { AnalyticsSummary } from '@/lib/analytics/aggregate';

type Props = {
  locale: Locale;
  data: AnalyticsSummary['viewership'];
};

export function ViewershipCard({ locale, data }: Props) {
  return (
    <section className="bg-brand-dark-card border border-brand-dark-border rounded-2xl p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-4">
        {t(locale, 'viewership')}
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          label={t(locale, 'concurrent_peak')}
          value={data.overallPeak}
          accent="red"
        />
        <StatCard
          label={t(locale, 'total_viewer_minutes')}
          value={data.totalViewerMinutes}
          accent="gold"
          suffix={t(locale, 'minutes')}
        />
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500 uppercase tracking-widest">
          <tr>
            <th className="text-left py-1">{t(locale, 'stream')}</th>
            <th className="text-right py-1">{t(locale, 'concurrent_peak')}</th>
            <th className="text-right py-1">{t(locale, 'total_viewer_minutes')}</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {data.byStream.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-gray-600 py-4">
                {t(locale, 'no_data')}
              </td>
            </tr>
          )}
          {data.byStream.map((s) => (
            <tr key={s.streamId} className="border-t border-brand-dark-border">
              <td className="py-1 font-mono text-xs">{s.streamId}</td>
              <td className="py-1 text-right tabular-nums">
                {s.concurrentPeak.toLocaleString('hu-HU')}
              </td>
              <td className="py-1 text-right tabular-nums">
                {s.totalViewerMinutes.toLocaleString('hu-HU')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
