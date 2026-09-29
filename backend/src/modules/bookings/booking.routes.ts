import { Router } from 'express';
import { getMyBookings } from './booking.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/my', requireAuth, getMyBookings);
router.get('/:id', (req, res) => res.json({ message: 'Get booking by id' }));
router.post('/:id/cancel', (req, res) => res.json({ message: 'Cancel booking' }));

export default router;
