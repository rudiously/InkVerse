import { Router } from 'express';
import * as engagement from '../controllers/engagement.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/chapters/:id/like', requireAuth, engagement.likeChapter);
router.delete('/chapters/:id/like', requireAuth, engagement.unlikeChapter);

router.post('/chapters/:id/bookmark', requireAuth, engagement.bookmarkChapter);
router.delete('/chapters/:id/bookmark', requireAuth, engagement.removeBookmark);
router.get('/bookmarks', requireAuth, engagement.myBookmarks);

export default router;
