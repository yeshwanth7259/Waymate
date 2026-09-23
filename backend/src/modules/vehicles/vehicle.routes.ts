import { Router } from 'express';
import { createVehicle, getVehicles, updateVehicle, deleteVehicle } from './vehicle.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, createVehicle);
router.get('/', requireAuth, getVehicles);
router.put('/:id', requireAuth, updateVehicle);
router.delete('/:id', requireAuth, deleteVehicle);

export default router;
