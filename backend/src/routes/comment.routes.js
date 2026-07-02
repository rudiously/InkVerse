import { Router } from 'express';
import { body } from 'express-validator';
import * as comment from '../controllers/comment.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from './validate.js';

const router = Router();

router.get('/chapters/:chapterId/comments', comment.getComments);
router.post(
  '/chapters/:chapterId/comments',
  requireAuth,
  [body('content').isLength({ min: 1, max: 2000 }).withMessage('Comment cannot be empty.')],
  validate,
  comment.addComment
);

router.put('/comments/:id', requireAuth, [body('content').isLength({ min: 1, max: 2000 })], validate, comment.editComment);
router.delete('/comments/:id', requireAuth, comment.deleteComment);
router.post('/comments/:id/like', requireAuth, comment.likeComment);
router.post('/comments/:id/report', requireAuth, [body('reason').notEmpty()], validate, comment.reportComment);

export default router;
