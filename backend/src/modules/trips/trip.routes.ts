import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { startTrip, completeTrip, cancelTrip, getTrip, getMyTrips, updateLocation } from './trip.controller';

const router = Router();

router.use(requireAuth);

router.get('/my', getMyTrips);
router.get('/:id', getTrip);
router.post('/:id/start', startTrip);
router.post('/:id/complete', completeTrip);
router.post('/:id/cancel', cancelTrip);
router.post('/:id/location', updateLocation);

export default router;
