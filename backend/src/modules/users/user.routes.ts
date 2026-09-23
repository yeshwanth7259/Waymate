import { Router } from 'express';
import { getMe, updateMe } from './user.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);

export default router;
