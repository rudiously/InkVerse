import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';
import api from '../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <Feather className="w-8 h-8 text-gold mx-auto mb-3" />
        <h1 className="font-display text-3xl">Reset your password</h1>
        <p className="text-brown-500 text-sm mt-1">We'll email you a link to reset it.</p>
      </div>

      {sent ? (
        <div className="bg-white/60 border border-brown-100/60 rounded-xl2 p-8 text-center text-sm text-brown-600">
          If an account exists for that email, a reset link has been sent. Check your inbox.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white/60 border border-brown-100/60 rounded-xl2 p-8 shadow-soft">
          <div>
            <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-brown-100 bg-white/80 focus:outline-none focus:border-gold text-sm"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-full bg-gold text-charcoal font-semibold hover:bg-gold-deep hover:text-cream transition-colors disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-brown-500 mt-6">
        <Link to="/login" className="text-gold-deep hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
