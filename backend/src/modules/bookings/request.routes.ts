import { Router } from 'express';
import { requestSeat, acceptRequest } from './booking.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// Notice: In the plan, request seat is POST /api/rides/:id/request, 
// so this file which is mounted at /api/requests is for request actions
router.post('/:id/accept', requireAuth, acceptRequest);

export default router;
