import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const createVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const { type, brand, model, registrationNumber, color, seatCapacity, helmetAvailable } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: user.id,
        type, // 'CAR' or 'BIKE'
        brand,
        model,
        registrationNumber,
        color,
        seatCapacity,
        helmetAvailable
      }
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVehicles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const vehicles = await prisma.vehicle.findMany({ where: { userId: user.id } });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data
    });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id: Number(id) } });
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
