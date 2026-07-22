'use client';

type Props = {
  label: string;
  value: number | string;
  suffix?: string;
  accent?: 'red' | 'gold' | 'muted';
  hint?: string;
};

export function StatCard({ label, value, suffix, accent = 'muted', hint }: Props) {
  const accentClass =
    accent === 'red'
      ? 'border-brand-red/60 bg-brand-red/10'
      : accent === 'gold'
        ? 'border-brand-gold/60 bg-brand-gold/10'
        : 'border-brand-dark-border bg-brand-dark-card';
  return (
    <div className={`rounded-xl border ${accentClass} p-4`}>
      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{label}</p>
      <p className="text-2xl font-black text-white tabular-nums mt-1">
        {typeof value === 'number' ? value.toLocaleString('hu-HU') : value}
        {suffix && <span className="text-sm text-gray-400 ml-1">{suffix}</span>}
      </p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
