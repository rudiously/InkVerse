import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';

const links = [
  { to: '/about', label: 'About' },
  { to: '/community', label: 'Community' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/contact', label: 'Contact' },
  { to: '/help', label: 'Help Center' },
];

export default function Footer() {
  return (
    <footer className="border-t border-brown-100/60 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-gold" strokeWidth={1.75} />
            <span className="font-display text-lg">InkVerse</span>
          </div>
          <p className="text-sm text-brown-500 mt-2 italic font-display">
            Write what you feel. Read what others lived.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-brown-500">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-gold-deep transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="text-center text-xs text-brown-300 pb-8">
        Copyright © 2026 InkVerse
      </div>
    </footer>
  );
}
