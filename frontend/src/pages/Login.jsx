import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(emailOrUsername, password);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <Feather className="w-8 h-8 text-gold mx-auto mb-3" />
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-brown-500 text-sm mt-1">Log in to continue writing and reading.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white/60 border border-brown-100/60 rounded-xl2 p-8 shadow-soft">
        {error && <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 block">Email or Username</label>
          <input
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-brown-100 bg-white/80 focus:outline-none focus:border-gold text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs uppercase tracking-wide text-brown-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-gold-deep hover:underline">Forgot password?</Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-brown-100 bg-white/80 focus:outline-none focus:border-gold text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-gold text-charcoal font-semibold hover:bg-gold-deep hover:text-cream transition-colors disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-brown-500 mt-6">
        New to InkVerse? <Link to="/register" className="text-gold-deep hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
