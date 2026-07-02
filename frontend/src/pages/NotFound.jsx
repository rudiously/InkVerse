import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <Feather className="w-10 h-10 text-gold mx-auto mb-4" />
      <h1 className="font-display text-3xl mb-2">Page not found</h1>
      <p className="text-brown-500 text-sm mb-6">This page may have been moved or doesn't exist.</p>
      <Link to="/" className="text-gold-deep hover:underline text-sm">Go back home</Link>
    </div>
  );
}
