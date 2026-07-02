import { Router } from 'express';
import { body } from 'express-validator';
import * as user from '../controllers/user.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from './validate.js';

const router = Router();

router.get('/:username', optionalAuth, user.getProfileByUsername);

router.put(
  '/me/profile',
  requireAuth,
  [
    body('displayName').optional().isLength({ max: 60 }),
    body('bio').optional().isLength({ max: 500 }),
    body('website').optional().isURL().withMessage('Website must be a valid URL.'),
  ],
  validate,
  user.updateMyProfile
);

router.post('/:userId/follow', requireAuth, user.followUser);
router.delete('/:userId/follow', requireAuth, user.unfollowUser);

router.get('/me/reading-history', requireAuth, user.getReadingHistory);

export default router;
