import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import rideRoutes from './modules/rides/ride.routes';
import requestRoutes from './modules/bookings/request.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import tripRoutes from './modules/trips/trip.routes';
import walletRoutes from './modules/wallet/wallet.routes';

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/wallet', walletRoutes);

export default app;
