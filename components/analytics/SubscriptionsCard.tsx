'use client';

import { t, type Locale } from '@/lib/analytics/i18n';
import { StatCard } from './StatCard';
import type { AnalyticsSummary } from '@/lib/analytics/aggregate';

type Props = {
  locale: Locale;
  data: AnalyticsSummary['subscriptions'];
};

export function SubscriptionsCard({ locale, data }: Props) {
  const fmtHuf = (n: number) =>
    n.toLocaleString('hu-HU');
  return (
    <section className="bg-brand-dark-card border border-brand-dark-border rounded-2xl p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-4">
        {t(locale, 'subscriptions')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t(locale, 'new_subs')} value={data.newCount} accent="red" />
        <StatCard label={t(locale, 'renewed')} value={data.renewedCount} accent="gold" />
        <StatCard label={t(locale, 'churned')} value={data.churnedCount} />
        <StatCard label={t(locale, 'net_change')} value={data.netChange} accent={data.netChange >= 0 ? 'gold' : 'red'} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <StatCard
          label={t(locale, 'revenue')}
          value={fmtHuf(data.revenueHuf)}
          suffix="HUF"
          accent="gold"
        />
        <StatCard
          label={t(locale, 'ltv')}
          value={fmtHuf(data.ltvHuf)}
          suffix="HUF"
        />
      </div>
    </section>
  );
}
