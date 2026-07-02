export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl2 bg-white/60 dark:bg-charcoal-soft border border-brown-100/60 p-5 flex items-center gap-4">
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-gold-deep" />
        </div>
      )}
      <div>
        <div className="font-display text-2xl text-charcoal dark:text-cream">{value}</div>
        <div className="text-xs text-brown-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}
