'use client';

import { t, type Locale } from '@/lib/analytics/i18n';
import { StatCard } from './StatCard';
import type { AnalyticsSummary } from '@/lib/analytics/aggregate';

type Props = {
  locale: Locale;
  data: AnalyticsSummary['activity'];
};

export function ActivityCard({ locale, data }: Props) {
  const rate = (data.returningRate * 100).toFixed(1);
  return (
    <section className="bg-brand-dark-card border border-brand-dark-border rounded-2xl p-5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-4">
        {t(locale, 'activity')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t(locale, 'signups')} value={data.signups} accent="red" />
        <StatCard label={t(locale, 'active_users')} value={data.activeUsers} accent="gold" />
        <StatCard label={t(locale, 'returning_users')} value={data.returningUsers} />
        <StatCard
          label={t(locale, 'returning_rate')}
          value={rate}
          suffix="%"
          accent="gold"
        />
      </div>
    </section>
  );
}
