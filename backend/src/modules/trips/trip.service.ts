import prisma from '../../config/prisma';
import { TripStatus } from '@prisma/client';
import { locationStore } from '../live/in-memory-location.store';
import { getLiveGateway } from '../live/live.gateway';

export const startTrip = async (tripId: number, userId: number) => {
  return prisma.$transaction(async (tx: any) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { ride: true }
    });

    if (!trip) throw new Error('NOT_FOUND');
    if (trip.ride.hostId !== userId) throw new Error('UNAUTHORIZED');
    if (trip.status !== 'SCHEDULED') throw new Error('INVALID_STATE');
    if (trip.ride.status === 'CANCELLED') throw new Error('INVALID_STATE');

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }
    });
  });
};

export const completeTrip = async (tripId: number, userId: number) => {
  return prisma.$transaction(async (tx: any) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { ride: true }
    });

    if (!trip) throw new Error('NOT_FOUND');
    if (trip.ride.hostId !== userId) throw new Error('UNAUTHORIZED');
    if (trip.status !== 'IN_PROGRESS') throw new Error('INVALID_STATE');

    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      }
    });
    
    // Clean up location data
    await locationStore.delete(tripId.toString());
    
    return updatedTrip;
  });
};

export const cancelTrip = async (tripId: number, userId: number) => {
  return prisma.$transaction(async (tx: any) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { ride: true }
    });

    if (!trip) throw new Error('NOT_FOUND');
    if (trip.ride.hostId !== userId) throw new Error('UNAUTHORIZED');
    if (trip.status !== 'SCHEDULED') throw new Error('INVALID_STATE'); // Only allow cancelling if scheduled

    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      }
    });

    // Clean up location data
    await locationStore.delete(tripId.toString());
    
    return updatedTrip;
  });
};

export const getTripById = async (tripId: number, userId: number) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      ride: {
        include: {
          host: { include: { profile: true } },
          bookings: {
            where: { status: 'CONFIRMED' },
            include: { rider: { include: { profile: true } } }
          }
        }
      }
    }
  });

  if (!trip) throw new Error('NOT_FOUND');

  // Check authorization: must be host OR confirmed rider
  const isHost = trip.ride.hostId === userId;
  const isRider = trip.ride.bookings.some((b: any) => b.riderId === userId);
  
  if (!isHost && !isRider) throw new Error('UNAUTHORIZED');

  // Map to a safe DTO, not exposing phones/emails
  return {
    id: trip.id,
    status: trip.status,
    startedAt: trip.startedAt,
    completedAt: trip.completedAt,
    ride: {
      id: trip.ride.id,
      from: trip.ride.from,
      to: trip.ride.to,
      departureTime: trip.ride.departureTime
    },
    host: {
      id: trip.ride.host.id,
      name: trip.ride.host.profile?.fullName,
      rating: trip.ride.host.profile?.rating
    },
    passengers: trip.ride.bookings.map((b: any) => ({
      id: b.rider.id,
      name: b.rider.profile?.fullName,
      status: b.status
    }))
  };
};

export const getMyTrips = async (userId: number) => {
  // Return trips where user is host OR confirmed rider
  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { ride: { hostId: userId } },
        { ride: { bookings: { some: { riderId: userId, status: 'CONFIRMED' } } } }
      ]
    },
    include: {
      ride: {
        include: { host: { include: { profile: true } } }
      }
    },
    orderBy: { ride: { departureTime: 'desc' } }
  });

  return trips.map((trip: any) => ({
    id: trip.id,
    status: trip.status,
    startedAt: trip.startedAt,
    ride: {
      id: trip.ride.id,
      from: trip.ride.from,
      to: trip.ride.to,
      departureTime: trip.ride.departureTime
    },
    host: {
      id: trip.ride.host.id,
      name: trip.ride.host.profile?.fullName
    }
  }));
};

import { LocationUpdate } from './location.types';

export const processLocationUpdate = async (tripId: number, userId: number, location: LocationUpdate) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { ride: true }
  });

  if (!trip) throw new Error('NOT_FOUND');
  if (trip.ride.hostId !== userId) throw new Error('UNAUTHORIZED');
  if (trip.status !== 'IN_PROGRESS') throw new Error('INVALID_STATE');

  // Store the location
  await locationStore.set(tripId.toString(), location);
  
  // Broadcast the location to Socket.IO room
  const gateway = getLiveGateway();
  gateway.broadcastLocation(tripId.toString(), location);
  
  return true;
};

