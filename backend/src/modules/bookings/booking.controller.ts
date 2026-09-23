import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const requestSeat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const rideId = Number(req.params.id);
    const { seats } = req.body;

    // Check ride exists and has seats
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.availableSeats < seats) {
      res.status(400).json({ error: 'Ride not available or not enough seats' });
      return;
    }

    if (ride.hostId === user.id) {
        res.status(400).json({ error: 'Cannot request a seat on your own ride' });
        return;
    }

    const request = await prisma.rideRequest.create({
      data: {
        rideId,
        riderId: user.id,
        seats,
        status: 'PENDING'
      }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const firebaseUid = req.user?.uid;
      const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  
      const requestId = Number(req.params.id);
  
      const request = await prisma.rideRequest.findUnique({ 
          where: { id: requestId },
          include: { ride: true }
      });

      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }

      // Only host can accept
      if (request.ride.hostId !== user.id) {
          res.status(403).json({ error: 'Unauthorized: Only host can accept' });
          return;
      }

      // Update Request
      const updatedRequest = await prisma.rideRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' }
      });

      // Update Ride Seats
      await prisma.ride.update({
          where: { id: request.rideId },
          data: { availableSeats: request.ride.availableSeats - request.seats }
      });

      // Create Booking
      const booking = await prisma.booking.create({
          data: {
              rideId: request.rideId,
              riderId: request.riderId,
              seats: request.seats,
              status: 'CONFIRMED'
          }
      });
  
      res.json({ request: updatedRequest, booking });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
