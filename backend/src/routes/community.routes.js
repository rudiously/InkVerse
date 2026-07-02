import { Router } from 'express';
import * as community from '../controllers/community.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/categories', community.listCategories);
router.get('/community', community.communityOverview);
router.get('/search', community.globalSearch);
router.get('/stats', community.platformStats);

router.get('/notifications', requireAuth, community.myNotifications);
router.post('/notifications/:id/read', requireAuth, community.markNotificationRead);
router.post('/notifications/read-all', requireAuth, community.markAllNotificationsRead);

export default router;
