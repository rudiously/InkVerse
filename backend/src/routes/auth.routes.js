import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from './validate.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required.'),
    body('username')
      .isLength({ min: 3, max: 24 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-24 characters, letters/numbers/underscore only.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('displayName').optional().isLength({ max: 60 }),
  ],
  validate,
  auth.register
);

router.post(
  '/login',
  authLimiter,
  [body('emailOrUsername').notEmpty(), body('password').notEmpty()],
  validate,
  auth.login
);

router.post('/logout', auth.logout);
router.post('/refresh', auth.refresh);

router.post('/verify-email', [body('token').notEmpty()], validate, auth.verifyEmail);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail()],
  validate,
  auth.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [body('token').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  auth.resetPassword
);

router.get('/me', requireAuth, auth.me);

export default router;
