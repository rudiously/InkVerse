import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Feather, Search, PenLine, Bookmark, Bell, User, Menu, X, Compass, Home, Users, BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/write', label: 'Write', icon: PenLine },
  { to: '/my-chapters', label: 'My Chapters', icon: BookOpen },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/community', label: 'Community', icon: Users },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass border-b border-brown-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Feather className="w-6 h-6 text-gold" strokeWidth={1.75} />
          <span className="font-display text-xl tracking-tight text-charcoal dark:text-cream">InkVerse</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brown-900 text-cream dark:bg-gold dark:text-charcoal'
                    : 'text-brown-700 hover:bg-beige-100 dark:text-cream/80 dark:hover:bg-charcoal-soft'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/explore?focusSearch=1')}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border border-brown-100 text-brown-500 hover:border-gold hover:text-gold transition-colors text-sm"
          >
            <Search className="w-4 h-4" /> Search
          </button>

          {user ? (
            <>
              <NavLink to="/notifications" className="p-2 rounded-full hover:bg-beige-100 dark:hover:bg-charcoal-soft">
                <Bell className="w-5 h-5 text-brown-700 dark:text-cream/80" />
              </NavLink>
              <NavLink to={`/profile/${user.username}`} className="p-2 rounded-full hover:bg-beige-100 dark:hover:bg-charcoal-soft">
                <User className="w-5 h-5 text-brown-700 dark:text-cream/80" />
              </NavLink>
              <button
                onClick={logout}
                className="hidden sm:inline-block px-4 py-2 rounded-full bg-brown-900 text-cream text-sm font-medium hover:bg-brown-700 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-block px-4 py-2 rounded-full text-brown-700 text-sm font-medium hover:bg-beige-100">
                Log in
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-full bg-gold text-charcoal text-sm font-semibold hover:bg-gold-deep hover:text-cream transition-colors shadow-soft">
                Start Writing
              </Link>
            </>
          )}

          <button className="lg:hidden p-2" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-brown-100/60 bg-cream dark:bg-charcoal px-4 py-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-brown-700 dark:text-cream/80 hover:bg-beige-100 dark:hover:bg-charcoal-soft"
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
