import { Router } from 'express';
import { body } from 'express-validator';
import * as chapter from '../controllers/chapter.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from './validate.js';

const router = Router();

router.get('/explore', chapter.exploreChapters);
router.get('/featured', chapter.getFeatured);
router.get('/trending', chapter.getTrending);
router.get('/mine', requireAuth, chapter.myChapters);
router.get('/:slug', optionalAuth, chapter.getChapterBySlug);

router.post(
  '/',
  requireAuth,
  [body('title').notEmpty().withMessage('Title is required.')],
  validate,
  chapter.createChapter
);

router.put('/:id', requireAuth, chapter.updateChapter);
router.delete('/:id', requireAuth, chapter.deleteChapter);
router.post('/:id/archive', requireAuth, chapter.archiveChapter);

export default router;
