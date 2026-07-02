import { verifyAccessToken } from '../utils/jwt.js';
import { supabase } from '../config/supabase.js';

/**
 * Requires a valid JWT access token in the Authorization header.
 * Populates req.user with { id, email, username, role }.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decoded = verifyAccessToken(token);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, role, is_suspended')
      .eq('id', decoded.sub)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ error: 'This account has been suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

/**
 * Attaches req.user if a valid token is present, but does not block the
 * request if there isn't one. Useful for routes like chapter reading where
 * anonymous users can view, but we personalize (e.g. isLiked) if logged in.
 */
export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const { data: user } = await supabase
      .from('users')
      .select('id, email, username, role')
      .eq('id', decoded.sub)
      .single();

    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do that.' });
    }
    next();
  };
}
