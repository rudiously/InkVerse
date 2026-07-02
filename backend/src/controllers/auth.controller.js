import { supabase } from '../config/supabase.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateToken, sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

function userPublic(user) {
  return { id: user.id, email: user.email, username: user.username, role: user.role, isVerified: user.is_verified };
}

function issueTokens(res, user) {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return accessToken;
}

export async function register(req, res, next) {
  try {
    const { email, username, password, displayName } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'An account with that email or username already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateToken();

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
        verification_token: verificationToken,
        verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('profiles').insert({
      user_id: user.id,
      display_name: displayName || username,
    });

    await sendVerificationEmail(email, verificationToken);

    const accessToken = issueTokens(res, user);
    res.status(201).json({
      message: 'Account created. Check your email to verify your account.',
      user: userPublic(user),
      accessToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { emailOrUsername, password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (user.is_suspended) {
      return res.status(403).json({ error: 'This account has been suspended.' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const accessToken = issueTokens(res, user);
    res.json({ user: userPublic(user), accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req, res) {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out.' });
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token.' });

    const decoded = verifyRefreshToken(token);
    const { data: user, error } = await supabase.from('users').select('*').eq('id', decoded.sub).single();
    if (error || !user) return res.status(401).json({ error: 'Invalid session.' });

    const accessToken = issueTokens(res, user);
    res.json({ accessToken, user: userPublic(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();

    if (!user || new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' });
    }

    await supabase
      .from('users')
      .update({ is_verified: true, verification_token: null, verification_token_expires: null })
      .eq('id', user.id);

    res.json({ message: 'Email verified. You can now enjoy full access to InkVerse.' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const { data: user } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();

    // Always respond the same way to avoid leaking which emails are registered.
    if (user) {
      const token = generateToken();
      await supabase
        .from('users')
        .update({
          reset_password_token: token,
          reset_password_token_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        })
        .eq('id', user.id);
      await sendPasswordResetEmail(user.email, token);
    }

    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('reset_password_token', token)
      .maybeSingle();

    if (!user || new Date(user.reset_password_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset link.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await supabase
      .from('users')
      .update({ password_hash: passwordHash, reset_password_token: null, reset_password_token_expires: null })
      .eq('id', user.id);

    res.json({ message: 'Password updated. You can now log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', req.user.id).single();
    res.json({ user: userPublic(req.user), profile });
  } catch (err) {
    next(err);
  }
}
