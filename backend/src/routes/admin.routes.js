import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', admin.adminDashboard);
router.delete('/chapters/:id', admin.adminDeleteChapter);
router.post('/chapters/:id/feature', admin.adminFeatureChapter);
router.post('/users/:id/suspend', admin.adminSuspendUser);
router.get('/reports', admin.adminListReports);
router.post('/reports/:id/resolve', admin.adminResolveReport);
router.post('/categories', admin.adminCreateCategory);
router.delete('/categories/:id', admin.adminDeleteCategory);

export default router;
