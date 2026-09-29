import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getAuth } from 'firebase-admin/auth';
import prisma from '../../config/prisma';
import { locationStore } from './in-memory-location.store';
import { LocationUpdate } from '../trips/location.types';

export class LiveGateway {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEvents();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        // Use same Firebase verification as REST auth middleware
        if (process.env.NODE_ENV === 'development' && token.startsWith('MOCK_')) {
          // Allow mock tokens for dev tests
          const uid = token.split('_').slice(1).join('_');
          (socket as any).user = { uid };
          return next();
        }

        const decodedToken = await getAuth().verifyIdToken(token);
        (socket as any).user = decodedToken;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEvents() {
    this.io.on('connection', (socket: Socket) => {
      socket.on('joinTrip', async (tripId: number) => {
        try {
          const firebaseUid = (socket as any).user.uid;
          const user = await prisma.user.findUnique({ where: { firebaseUid } });
          if (!user) {
            socket.emit('error', 'User not found');
            return;
          }

          const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
              ride: {
                include: {
                  bookings: { where: { status: 'CONFIRMED' } }
                }
              }
            }
          });

          if (!trip) {
            socket.emit('error', 'Trip not found');
            return;
          }

          // Authorize: Must be Host OR Confirmed Rider
          const isHost = trip.ride.hostId === user.id;
          const isRider = trip.ride.bookings.some(b => b.riderId === user.id);

          if (!isHost && !isRider) {
            socket.emit('error', 'Unauthorized to join this trip room');
            return;
          }

          const roomName = `trip_${tripId}`;
          socket.join(roomName);

          // Send current location immediately if available
          const latestLocation = await locationStore.get(tripId.toString());
          if (latestLocation) {
            socket.emit('location:current', latestLocation);
          }
        } catch (error) {
          socket.emit('error', 'Internal server error during join');
        }
      });
    });
  }

  // Called by TripService (via Event Emitter or directly)
  public broadcastLocation(tripId: string, location: LocationUpdate) {
    this.io.to(`trip_${tripId}`).emit('location:update', location);
  }
}

// Singleton for easy access across the app
let gatewayInstance: LiveGateway;

export const initLiveGateway = (server: HttpServer) => {
  gatewayInstance = new LiveGateway(server);
  return gatewayInstance;
};

export const getLiveGateway = () => {
  if (!gatewayInstance) {
    throw new Error('LiveGateway has not been initialized');
  }
  return gatewayInstance;
};
