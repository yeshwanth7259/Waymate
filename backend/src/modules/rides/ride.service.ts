import prisma from '../../config/prisma';

export const createRide = async (data: {
  hostId: number;
  vehicleId: number;
  from: string;
  to: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  polyline?: string;
  departureTime: Date;
  availableSeats: number;
  purpose: string;
}) => {
  return prisma.$transaction(async (tx) => {
    // Check if vehicle belongs to host
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId }
    });

    if (!vehicle || vehicle.userId !== data.hostId) {
      throw new Error('INVALID_VEHICLE');
    }

    // 1. Create the Ride
    const ride = await tx.ride.create({
      data: {
        hostId: data.hostId,
        vehicleId: data.vehicleId,
        from: data.from,
        to: data.to,
        fromLat: data.fromLat,
        fromLng: data.fromLng,
        toLat: data.toLat,
        toLng: data.toLng,
        polyline: data.polyline,
        departureTime: data.departureTime,
        availableSeats: data.availableSeats,
        purpose: data.purpose,
        status: 'ACTIVE'
      },
    });

    // 2. Automatically create the Trip for the Ride
    const trip = await tx.trip.create({
      data: {
        rideId: ride.id,
        status: 'SCHEDULED'
      }
    });

    return { ride, trip };
  });
};
