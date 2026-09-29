import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as tripService from './trip.service';
import prisma from '../../config/prisma';

export const startTrip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const tripId = Number(req.params.id);
    const updatedTrip = await tripService.startTrip(tripId, user.id);
    res.json({ message: 'Trip started', trip: updatedTrip });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') res.status(404).json({ error: 'Trip not found' });
    else if (error.message === 'UNAUTHORIZED') res.status(403).json({ error: 'Unauthorized' });
    else if (error.message === 'INVALID_STATE') res.status(400).json({ error: 'Invalid trip state for this operation' });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeTrip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const tripId = Number(req.params.id);
    const updatedTrip = await tripService.completeTrip(tripId, user.id);
    res.json({ message: 'Trip completed', trip: updatedTrip });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') res.status(404).json({ error: 'Trip not found' });
    else if (error.message === 'UNAUTHORIZED') res.status(403).json({ error: 'Unauthorized' });
    else if (error.message === 'INVALID_STATE') res.status(400).json({ error: 'Invalid trip state for this operation' });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelTrip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const tripId = Number(req.params.id);
    const updatedTrip = await tripService.cancelTrip(tripId, user.id);
    res.json({ message: 'Trip cancelled', trip: updatedTrip });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') res.status(404).json({ error: 'Trip not found' });
    else if (error.message === 'UNAUTHORIZED') res.status(403).json({ error: 'Unauthorized' });
    else if (error.message === 'INVALID_STATE') res.status(400).json({ error: 'Invalid trip state for this operation' });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTrip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const tripId = Number(req.params.id);
    const trip = await tripService.getTripById(tripId, user.id);
    res.json(trip);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') res.status(404).json({ error: 'Trip not found' });
    else if (error.message === 'UNAUTHORIZED') res.status(403).json({ error: 'Unauthorized' });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTrips = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const trips = await tripService.getMyTrips(user.id);
    res.json(trips);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { validateLocation } from './location.types';

export const updateLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const tripId = Number(req.params.id);
    const location = req.body;

    if (!validateLocation(location)) {
      res.status(400).json({ error: 'Invalid location payload' });
      return;
    }

    await tripService.processLocationUpdate(tripId, user.id, location);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') res.status(404).json({ error: 'Trip not found' });
    else if (error.message === 'UNAUTHORIZED') res.status(403).json({ error: 'Unauthorized' });
    else if (error.message === 'INVALID_STATE') res.status(400).json({ error: 'Trip is not IN_PROGRESS' });
    else res.status(500).json({ error: 'Internal server error' });
  }
};
