import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      const details = err.response?.data?.details;
      setError(details?.[0]?.message || err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Feather className="w-10 h-10 text-gold mx-auto mb-4" />
        <h1 className="font-display text-2xl mb-2">Welcome to InkVerse</h1>
        <p className="text-brown-500 text-sm">Check your inbox to verify your email. Taking you home now...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Feather className="w-8 h-8 text-gold mx-auto mb-3" />
        <h1 className="font-display text-3xl">Join InkVerse</h1>
        <p className="text-brown-500 text-sm mt-1">Create your account and start writing today.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white/60 border border-brown-100/60 rounded-xl2 p-8 shadow-soft">
        {error && <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

        <Field label="Display Name" value={form.displayName} onChange={(v) => update('displayName', v)} />
        <Field label="Username" value={form.username} onChange={(v) => update('username', v)} required pattern="^[a-zA-Z0-9_]+$" hint="Letters, numbers, underscore only" />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
        <Field label="Password" type="password" value={form.password} onChange={(v) => update('password', v)} required minLength={8} hint="At least 8 characters" />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-gold text-charcoal font-semibold hover:bg-gold-deep hover:text-cream transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-brown-500 mt-6">
        Already have an account? <Link to="/login" className="text-gold-deep hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, hint, ...rest }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-brown-100 bg-white/80 focus:outline-none focus:border-gold text-sm"
        {...rest}
      />
      {hint && <p className="text-[11px] text-brown-300 mt-1">{hint}</p>}
    </div>
  );
}
