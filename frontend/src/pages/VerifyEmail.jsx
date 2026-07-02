import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Feather } from 'lucide-react';
import api from '../api/client.js';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = params.get('token');
    if (!token) return setStatus('error');
    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Feather className="w-10 h-10 text-gold mx-auto mb-4" />
      {status === 'verifying' && <p className="text-brown-500">Verifying your email...</p>}
      {status === 'success' && (
        <>
          <h1 className="font-display text-2xl mb-2">Email verified</h1>
          <p className="text-brown-500 text-sm mb-6">Your account is ready. Welcome to InkVerse.</p>
          <Link to="/" className="text-gold-deep hover:underline text-sm">Go to Home</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="font-display text-2xl mb-2">Verification failed</h1>
          <p className="text-brown-500 text-sm">This link is invalid or has expired.</p>
        </>
      )}
    </div>
  );
}
