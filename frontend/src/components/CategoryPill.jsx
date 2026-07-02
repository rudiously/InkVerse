export default function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
        active
          ? 'bg-brown-900 text-cream border-brown-900 dark:bg-gold dark:text-charcoal dark:border-gold'
          : 'border-brown-100 text-brown-500 hover:border-gold hover:text-gold-deep'
      }`}
    >
      {label}
    </button>
  );
}
