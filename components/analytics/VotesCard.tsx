'use client';

import { t, type Locale } from '@/lib/analytics/i18n';
import { StatCard } from './StatCard';
import type { AnalyticsSummary } from '@/lib/analytics/aggregate';

type Props = {
  locale: Locale;
  data: AnalyticsSummary['votes'];
};

export function VotesCard({ locale, data }: Props) {
  return (
    <section className="bg-brand-dark-card border border-brand-dark-border rounded-2xl p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-4">
        {t(locale, 'votes')}
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label={t(locale, 'free_votes')} value={data.freeCount} accent="muted" />
        <StatCard label={t(locale, 'paid_votes')} value={data.paidCount} accent="gold" />
        <StatCard
          label={t(locale, 'vote_revenue')}
          value={data.revenueHuf.toLocaleString('hu-HU')}
          suffix="HUF"
          accent="red"
        />
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500 uppercase tracking-widest">
          <tr>
            <th className="text-left py-1">{t(locale, 'option')}</th>
            <th className="text-right py-1">{t(locale, 'count')}</th>
            <th className="text-right py-1">{t(locale, 'revenue')}</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {data.byOption.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center text-gray-600 py-4">
                {t(locale, 'no_data')}
              </td>
            </tr>
          )}
          {data.byOption.map((o) => (
            <tr key={o.optionId} className="border-t border-brand-dark-border">
              <td className="py-1 font-mono text-xs">{o.optionId}</td>
              <td className="py-1 text-right tabular-nums">{o.count.toLocaleString('hu-HU')}</td>
              <td className="py-1 text-right tabular-nums">
                {o.revenueHuf.toLocaleString('hu-HU')} HUF
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
