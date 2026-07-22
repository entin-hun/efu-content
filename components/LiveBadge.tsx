export function LiveBadge({ live = false }: { live?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
        live
          ? 'bg-brand-red/20 border border-brand-red/50 text-brand-red'
          : 'bg-brand-gold/20 border border-brand-gold/50 text-brand-gold'
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${live ? 'bg-brand-red animate-pulse' : 'bg-brand-gold'}`}
      />
      {live ? 'Élő' : 'Következő'}
    </div>
  );
}
