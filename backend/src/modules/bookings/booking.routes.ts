import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get bookings' }));
router.get('/:id', (req, res) => res.json({ message: 'Get booking by id' }));
router.post('/:id/cancel', (req, res) => res.json({ message: 'Cancel booking' }));

export default router;
