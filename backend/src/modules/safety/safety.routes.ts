import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { handleSos, handleReport } from './safety.controller';

const router = Router();

router.use(authenticate);

router.post('/sos', handleSos);
router.post('/report', handleReport);

export default router;
