'use client';

import { t, type Locale } from '@/lib/analytics/i18n';
import { StatCard } from './StatCard';
import type { AnalyticsSummary } from '@/lib/analytics/aggregate';

type Props = {
  locale: Locale;
  data: AnalyticsSummary['visitors'];
};

export function VisitorsCard({ locale, data }: Props) {
  return (
    <section className="bg-brand-dark-card border border-brand-dark-border rounded-2xl p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-4">
        {t(locale, 'visitors')}
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label={t(locale, 'page_views')} value={data.pageViews} accent="red" />
        <StatCard label={t(locale, 'unique_visitors')} value={data.uniqueVisitors} accent="gold" />
      </div>
      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
        {t(locale, 'by_locale')}
      </p>
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500 uppercase tracking-widest">
          <tr>
            <th className="text-left py-1">locale</th>
            <th className="text-right py-1">{t(locale, 'views')}</th>
            <th className="text-right py-1">{t(locale, 'unique')}</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {data.byLocale.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-gray-600 py-4">
                {t(locale, 'no_data')}
              </td>
            </tr>
          )}
          {data.byLocale.map((row) => (
            <tr key={row.locale} className="border-t border-brand-dark-border">
              <td className="py-1 uppercase font-mono text-xs">{row.locale}</td>
              <td className="py-1 text-right tabular-nums">{row.views.toLocaleString('hu-HU')}</td>
              <td className="py-1 text-right tabular-nums">{row.uniques.toLocaleString('hu-HU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
