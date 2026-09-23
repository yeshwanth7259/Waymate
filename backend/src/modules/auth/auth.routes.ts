import { Router } from 'express';
import { syncUser, me } from './auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/sync', requireAuth, syncUser);
router.get('/me', requireAuth, me);

export default router;
