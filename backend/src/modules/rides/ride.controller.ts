import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { calculateMatchScore } from '../matching/matching.service';
import * as rideService from './ride.service';

export const offerRide = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const { vehicleId, from, to, fromLat, fromLng, toLat, toLng, polyline, departureTime, availableSeats, purpose } = req.body;

    const result = await rideService.createRide({
      hostId: user.id,
      vehicleId,
      from,
      to,
      fromLat,
      fromLng,
      toLat,
      toLng,
      polyline,
      departureTime: new Date(departureTime),
      availableSeats,
      purpose
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'INVALID_VEHICLE') {
      res.status(400).json({ error: 'Invalid vehicle or does not belong to you' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const searchRides = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! }, include: { profile: true } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const { from, to, date, seats, vehicleType } = req.query;
    
    // Find active rides with available seats
    let rides = await prisma.ride.findMany({
      where: {
        status: 'ACTIVE',
        availableSeats: { gte: Number(seats) || 1 }
      },
      include: {
        host: { include: { profile: true } },
        vehicle: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: { rider: { include: { profile: true } } }
        }
      }
    });

    // Optional: Filter by vehicleType (CAR/BIKE)
    if (vehicleType) {
      rides = rides.filter(r => r.vehicle.type === vehicleType);
    }

    // Safety Policy Enforcement
    rides = rides.filter(ride => {
      // Composition of this ride
      const hostGender = ride.host.profile?.gender;
      const passengerGenders = ride.bookings.map(b => b.rider.profile?.gender);
      
      const isRiderFemale = user.profile?.gender === 'FEMALE';
      const riderSafetyMode = user.profile?.safetyMode || 'STANDARD';

      if (isRiderFemale && riderSafetyMode === 'WOMEN_ONLY') {
        if (hostGender !== 'FEMALE') return false;
        if (passengerGenders.includes('MALE')) return false;
      }

      if (isRiderFemale && ride.vehicle.type === 'BIKE') {
        // Optional strict bike rule for women
        if (riderSafetyMode === 'WOMEN_ONLY' && hostGender !== 'FEMALE') return false;
      }

      return true;
    });

    // Advanced filtering & scoring using Matching Engine
    const matchedRides = rides.map(ride => {
      const score = calculateMatchScore(ride, {
        from: from ? String(from) : undefined,
        to: to ? String(to) : undefined,
        date: date ? String(date) : undefined
      });
      return { ...ride, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(matchedRides);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRide = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: Number(req.params.id) },
      include: { 
        host: { include: { profile: true }}, 
        vehicle: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: { rider: { include: { profile: true } } }
        }
      }
    });
    if (!ride) { res.status(404).json({ error: 'Ride not found' }); return; }
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyRides = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const firebaseUid = req.user?.uid;
      const user = await prisma.user.findUnique({ where: { firebaseUid: firebaseUid! } });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  
      const rides = await prisma.ride.findMany({
        where: { hostId: user.id },
        include: { vehicle: true }
      });
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
};
