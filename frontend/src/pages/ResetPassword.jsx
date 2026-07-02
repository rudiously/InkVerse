import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Feather } from 'lucide-react';
import api from '../api/client.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <Feather className="w-8 h-8 text-gold mx-auto mb-3" />
        <h1 className="font-display text-3xl">Set a new password</h1>
      </div>

      {done ? (
        <div className="bg-white/60 border border-brown-100/60 rounded-xl2 p-8 text-center text-sm text-brown-600">
          Password updated. Redirecting you to log in...
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white/60 border border-brown-100/60 rounded-xl2 p-8 shadow-soft">
          {error && <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-lg border border-brown-100 bg-white/80 focus:outline-none focus:border-gold text-sm"
            />
          </div>
          <button type="submit" disabled={loading || !token} className="w-full py-2.5 rounded-full bg-gold text-charcoal font-semibold hover:bg-gold-deep hover:text-cream transition-colors disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          {!token && <p className="text-xs text-red-500">Missing reset token — use the link from your email.</p>}
        </form>
      )}
      <p className="text-center text-sm text-brown-500 mt-6">
        <Link to="/login" className="text-gold-deep hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
