import nodemailer from 'nodemailer';
import crypto from 'crypto';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, CLIENT_URL } = process.env;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendMail({ to, subject, html }) {
  // In development without SMTP configured, log instead of throwing so the
  // rest of the auth flow can still be exercised locally.
  if (!SMTP_USER) {
    // eslint-disable-next-line no-console
    console.log(`[InkVerse email:dev] to=${to} subject="${subject}"\n${html}`);
    return;
  }
  await getTransporter().sendMail({ from: EMAIL_FROM, to, subject, html });
}

export async function sendVerificationEmail(to, token) {
  const link = `${CLIENT_URL}/verify-email?token=${token}`;
  await sendMail({
    to,
    subject: 'Verify your InkVerse account',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: auto;">
        <h2 style="color:#3a2e26;">Welcome to InkVerse</h2>
        <p>Confirm your email to start writing and publishing.</p>
        <p><a href="${link}" style="background:#c9a24b;color:#fff;padding:12px 24px;
          border-radius:8px;text-decoration:none;display:inline-block;">Verify Email</a></p>
        <p style="color:#888;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  await sendMail({
    to,
    subject: 'Reset your InkVerse password',
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: auto;">
        <h2 style="color:#3a2e26;">Reset your password</h2>
        <p>We received a request to reset your InkVerse password.</p>
        <p><a href="${link}" style="background:#c9a24b;color:#fff;padding:12px 24px;
          border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a></p>
        <p style="color:#888;font-size:12px;">If you didn't request this, you can ignore this email. This link expires in 1 hour.</p>
      </div>
    `,
  });
}
