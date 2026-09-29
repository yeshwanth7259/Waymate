import { Router } from 'express';
import { offerRide, searchRides, getRide, getMyRides } from './ride.controller';
import { requestSeat } from '../bookings/booking.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, offerRide);
router.get('/search', requireAuth, searchRides);
router.get('/my', requireAuth, getMyRides);
router.get('/:id', requireAuth, getRide);
router.post('/:id/request', requireAuth, requestSeat);

export default router;
