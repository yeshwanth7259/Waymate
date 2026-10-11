import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Server } from 'socket.io';
import { PrismaClient, LocationRole, Gender, KycStatus, DocumentStatus, DocumentType } from '@prisma/client';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { z } from 'zod';
import { calculateCommission, estimateSeatFare, PLATFORM_COMMISSION_RATE } from './pricing.js';
import { OmniRouteError, requestOmniRoute } from './omniroute.js';

const prisma = new PrismaClient();
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? '*', methods: ['GET', 'POST', 'PATCH'] } });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => { const ok = ['image/jpeg','image/png','image/webp','application/pdf'].includes(file.mimetype); if (ok) cb(null, true); else cb(new Error('Only JPG, PNG, WEBP or PDF documents are allowed')); } });
const localUploadDir = path.resolve(process.env.LOCAL_UPLOAD_DIR || './uploads');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
const firebaseAuthEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim();

if (!getApps().length) {
  if (!firebaseProjectId) {
    throw new Error('FIREBASE_PROJECT_ID is required. Set it to the same Firebase project used by the mobile and web apps.');
  }
  if (Boolean(firebaseClientEmail) !== Boolean(firebasePrivateKey)) {
    throw new Error('FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be configured together, or use Application Default Credentials.');
  }
  if (firebaseAuthEmulator && process.env.NODE_ENV === 'production') {
    throw new Error('FIREBASE_AUTH_EMULATOR_HOST must never be enabled in production.');
  }

  initializeApp({
    ...(firebaseAuthEmulator
      ? {}
      : firebaseClientEmail && firebasePrivateKey
        ? {
            credential: cert({
              projectId: firebaseProjectId,
              clientEmail: firebaseClientEmail,
              privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
            }),
          }
        : { credential: applicationDefault() }),
    projectId: firebaseProjectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

type AuthReq = express.Request & { user?: { uid: string; email?: string; phone_number?: string } };
const pathId = (req: express.Request) => z.string().min(1).parse(req.params.id);

async function auth(req: AuthReq, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
  try {
    const token = header.slice(7);
    const decoded = await getAuth().verifyIdToken(token);
    if (!decoded?.uid) throw new Error('invalid');
    req.user = { uid: decoded.uid, email: decoded.email, phone_number: decoded.phone_number };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
}

async function dbUser(req: AuthReq) {
  if (!req.user) throw new Error('auth');
  return prisma.user.upsert({
    where: { firebaseUid: req.user.uid },
    update: { email: req.user.email, phone: req.user.phone_number },
    create: { firebaseUid: req.user.uid, email: req.user.email, phone: req.user.phone_number },
  });
}

async function admin(req: AuthReq, res: express.Response, next: express.NextFunction) {
  await auth(req, res, async () => {
    const uid = req.user!.uid;
    const allowList = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
    let allowed = allowList.includes(uid);
    if (!allowed && getApps().length) {
      try { allowed = (await getAuth().getUser(uid)).customClaims?.admin === true; } catch {}
    }
    if (!allowed) return res.status(403).json({ message: 'Admin access required' });
    next();
  });
}

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(), heading: z.number().min(0).lt(360).optional(),
  speed: z.number().nonnegative().optional(), timestamp: z.string().datetime(),
});
const profileSchema = z.object({ firstName: z.string().trim().min(2).max(60), lastName: z.string().trim().min(1).max(60), gender: z.enum(['MALE','FEMALE','OTHER']), email: z.string().email().optional().or(z.literal('')) });
const safetyPolicyDefaults = { womenSafetyEnabled: true, requireVerifiedHostForWomenOnly: true, requireVerifiedVehicleForWomenOnly: true, requireFemaleCompanionForSoloFemaleRider: true, femaleCompanionMinimum: 2, requireKycForBooking: true, requireKycForOffering: true };

async function safetyPolicy() {
  return prisma.safetyPolicy.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default', ...safetyPolicyDefaults } });
}

async function userKycComplete(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, include: { documents: true } });
  if (!u) return false;
  const identity = u.documents.some(d => d.type === DocumentType.IDENTITY && d.status === DocumentStatus.VERIFIED);
  const selfie = u.documents.some(d => d.type === DocumentType.SELFIE && d.status === DocumentStatus.VERIFIED);
  return u.kycStatus === KycStatus.VERIFIED && identity && selfie;
}

async function vehicleReady(vehicleId: string) {
  const v = await prisma.vehicle.findUnique({ where: { id: vehicleId }, include: { documents: true, owner: true } });
  if (!v) return false;
  const rc = v.documents.some(d => d.type === DocumentType.RC && d.status === DocumentStatus.VERIFIED);
  const insurance = v.documents.some(d => d.type === DocumentType.INSURANCE && d.status === DocumentStatus.VERIFIED);
  return v.verified && rc && insurance && Boolean(v.insuranceExpiry && v.insuranceExpiry > new Date());
}

async function storeDocument(buffer: Buffer, filename: string, mimeType: string, folder: string) {
  const ext = path.extname(filename) || '.bin';
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const objectPath = `${folder}/${safe}`;
  if (process.env.DOCUMENT_STORAGE === 'firebase' && getApps().length && process.env.FIREBASE_STORAGE_BUCKET) {
    const bucket = getStorage().bucket();
    const file = bucket.file(objectPath);
    await file.save(buffer, { resumable: false, metadata: { contentType: mimeType, metadata: { originalName: filename } } });
    return objectPath;
  }
  const localPath = path.join(localUploadDir, objectPath);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, buffer);
  return localPath;
}

async function sendStoredDocument(res: express.Response, filePath: string) {
  if (process.env.DOCUMENT_STORAGE === 'firebase' && getApps().length && process.env.FIREBASE_STORAGE_BUCKET) {
    const [url] = await getStorage().bucket().file(filePath).getSignedUrl({ action: 'read', expires: Date.now() + 10 * 60 * 1000 });
    return res.json({ url, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  }
  return res.sendFile(path.resolve(filePath));
}

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'waymate-backend' }));

app.post('/api/auth/sync', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  res.json({ id: u.id, firebaseUid: u.firebaseUid, phone: u.phone, email: u.email, firstName: u.firstName, lastName: u.lastName, gender: u.gender, kycStatus: u.kycStatus, verified: u.verified, rating: u.rating });
});
app.get('/api/users/me', auth, async (req: AuthReq, res) => res.json(await dbUser(req)));
app.put('/api/users/me', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req); const d = profileSchema.parse(req.body);
  const updated = await prisma.user.update({ where: { id: u.id }, data: { ...d, email: d.email || undefined } });
  res.json(updated);
});
app.get('/api/onboarding/status', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const docs = await prisma.kycDocument.findMany({ where: { userId: u.id } });
  const vehicles = await prisma.vehicle.findMany({ where: { ownerId: u.id }, include: { documents: true } });
  res.json({
    profileComplete: Boolean(u.firstName && u.lastName && u.gender),
    kycStatus: u.kycStatus,
    identityVerified: docs.some(d => d.type === 'IDENTITY' && d.status === 'VERIFIED'),
    selfieVerified: docs.some(d => d.type === 'SELFIE' && d.status === 'VERIFIED'),
    vehicles: vehicles.map(v => ({ id: v.id, type: v.type, verified: v.verified, rcVerified: v.documents.some(d => d.type === 'RC' && d.status === 'VERIFIED'), insuranceVerified: v.documents.some(d => d.type === 'INSURANCE' && d.status === 'VERIFIED') })),
    canBook: !(await safetyPolicy()).requireKycForBooking || await userKycComplete(u.id),
    canOffer: (!(await safetyPolicy()).requireKycForOffering || await userKycComplete(u.id))
      && docs.some(d => d.type === 'DRIVING_LICENSE' && d.status === 'VERIFIED')
      && vehicles.some(v => v.verified && v.documents.some(d => d.type === 'RC' && d.status === 'VERIFIED') && v.documents.some(d => d.type === 'INSURANCE' && d.status === 'VERIFIED') && Boolean(v.insuranceExpiry && v.insuranceExpiry > new Date())),
  });
});

app.get('/api/pricing/estimate', auth, async (req, res) => {
  const query = z.object({
    vehicleType: z.enum(['CAR', 'BIKE']),
    distanceKm: z.coerce.number().positive().max(2000),
    durationMinutes: z.coerce.number().int().positive().max(1440),
  }).parse(req.query);
  res.json(estimateSeatFare(query.vehicleType, query.distanceKm, query.durationMinutes));
});

app.post('/api/assistant/route-advice', auth, async (req, res) => {
  const input = z.object({
    origin: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(120),
    vehicleType: z.enum(['CAR', 'BIKE']),
    distanceKm: z.number().positive().max(2000).optional(),
    durationMinutes: z.number().int().positive().max(1440).optional(),
    question: z.string().trim().max(500).optional(),
  }).refine(value => value.distanceKm === undefined || value.durationMinutes !== undefined, {
    message: 'Distance and duration must be provided together.',
  }).refine(value => value.durationMinutes === undefined || value.distanceKm !== undefined, {
    message: 'Distance and duration must be provided together.',
  }).parse(req.body);
  const estimate = input.distanceKm !== undefined && input.durationMinutes !== undefined
    ? estimateSeatFare(input.vehicleType, input.distanceKm, input.durationMinutes)
    : null;
  const answer = await requestOmniRoute([
    {
      role: 'system',
      content: 'You are WayMate’s route and fare assistant. Give concise, practical ride-sharing guidance. You do not have live map, traffic, competitor-price, or route-provider access; never claim that you checked them. Use only the supplied route and estimate. Treat the estimate as authoritative guidance and never invent or change a fare. Riders pay the driver directly after a completed ride; there is no in-app online payment. Explain that the platform commission is 12% of the confirmed driver fare only when relevant. Never request OTPs, passwords, identity-document images, or payment credentials.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        origin: input.origin,
        destination: input.destination,
        vehicleType: input.vehicleType,
        distanceKm: input.distanceKm,
        estimatedDurationMinutes: input.durationMinutes,
        fareGuidance: estimate,
        question: input.question,
      }),
    },
  ]);
  res.json({ answer, estimate });
});

app.post('/api/assistant/support', auth, async (req, res) => {
  const input = z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1).max(2000),
    })).min(1).max(10),
  }).parse(req.body);
  if (input.messages[input.messages.length - 1]?.role !== 'user') {
    return res.status(400).json({ message: 'The latest support message must be from the user.' });
  }
  const answer = await requestOmniRoute([
    {
      role: 'system',
      content: 'You are WayMate’s rider and driver support assistant. Answer only from these known product rules: riders pay drivers directly by cash or UPI after a completed trip; WayMate does not process rider payments or automatic payouts; confirmed cash collection records a 12% platform commission due from the driver; KYC documents are reviewed by WayMate admins; bookings and rides are managed in the app. Do not claim to access accounts, change bookings, review KYC, issue refunds, or verify external payments. Never ask for passwords, OTP codes, full payment credentials, or document images. For immediate danger tell the user to use the in-app SOS feature and contact local emergency services. If a product rule is unclear, say so and direct the user to WayMate support.',
    },
    ...input.messages,
  ]);
  res.json({ answer });
});

app.get('/api/kyc/me', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req); const docs = await prisma.kycDocument.findMany({ where: { userId: u.id }, select: { id: true, type: true, status: true, rejectionReason: true, createdAt: true, reviewedAt: true } });
  res.json({ kycStatus: u.kycStatus, documents: docs });
});
app.post('/api/kyc/documents', auth, upload.single('file'), async (req: AuthReq, res) => {
  const u = await dbUser(req); if (!req.file) return res.status(400).json({ message: 'Document file is required' });
  const type = z.enum(['IDENTITY','SELFIE','DRIVING_LICENSE']).parse(req.body.type);
  if (type === 'DRIVING_LICENSE' && !u.firstName) return res.status(400).json({ message: 'Complete your profile first' });
  const filePath = await storeDocument(req.file.buffer, req.file.originalname, req.file.mimetype, `kyc/${u.id}`);
  const doc = await prisma.kycDocument.upsert({ where: { userId_type: { userId: u.id, type } }, update: { filePath, mimeType: req.file.mimetype, originalName: req.file.originalname, status: 'PENDING', rejectionReason: null, reviewedBy: null, reviewedAt: null }, create: { userId: u.id, type, filePath, mimeType: req.file.mimetype, originalName: req.file.originalname } });
  await prisma.user.update({ where: { id: u.id }, data: { kycStatus: 'PENDING', kycSubmittedAt: new Date(), verified: false } });
  res.status(201).json({ id: doc.id, type: doc.type, status: doc.status });
});
app.post('/api/kyc/submit', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req); const docs = await prisma.kycDocument.findMany({ where: { userId: u.id } });
  if (!u.firstName || !u.lastName || !u.gender) return res.status(400).json({ message: 'Complete your profile before submitting KYC.' });
  const required = [DocumentType.IDENTITY, DocumentType.SELFIE];
  if (!required.every(t => docs.some(d => d.type === t))) return res.status(400).json({ message: 'Upload identity document and selfie before submitting KYC' });
  const out = await prisma.user.update({ where: { id: u.id }, data: { kycStatus: 'PENDING', kycSubmittedAt: new Date(), verified: false } });
  res.json({ kycStatus: out.kycStatus });
});

app.get('/api/vehicles', auth, async (req: AuthReq, res) => { const u = await dbUser(req); res.json(await prisma.vehicle.findMany({ where: { ownerId: u.id }, include: { documents: { select: { id: true, type: true, status: true, rejectionReason: true } } }, orderBy: { createdAt: 'desc' } })); });
app.post('/api/vehicles', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req); const d = z.object({ type: z.enum(['CAR','BIKE']), make: z.string().min(2), model: z.string().min(1), registrationNumber: z.string().min(3).max(20), color: z.string().optional(), seats: z.number().int().min(1).max(7), insuranceExpiry: z.string().datetime() }).parse(req.body);
  if (!(await userKycComplete(u.id))) return res.status(403).json({ code: 'KYC_REQUIRED', message: 'Complete and verify your KYC before adding a vehicle.' });
  res.status(201).json(await prisma.vehicle.create({ data: { ...d, ownerId: u.id, insuranceExpiry: new Date(d.insuranceExpiry) } }));
});
app.post('/api/vehicles/:id/documents', auth, upload.single('file'), async (req: AuthReq, res) => {
  const u = await dbUser(req); const v = await prisma.vehicle.findFirst({ where: { id: pathId(req), ownerId: u.id } });
  if (!v) return res.status(404).json({ message: 'Vehicle not found' }); if (!req.file) return res.status(400).json({ message: 'Document file is required' });
  const type = z.enum(['RC','INSURANCE']).parse(req.body.type);
  const filePath = await storeDocument(req.file.buffer, req.file.originalname, req.file.mimetype, `vehicles/${v.id}`);
  const doc = await prisma.vehicleDocument.upsert({ where: { vehicleId_type: { vehicleId: v.id, type } }, update: { filePath, mimeType: req.file.mimetype, originalName: req.file.originalname, status: 'PENDING', rejectionReason: null, reviewedBy: null, reviewedAt: null }, create: { vehicleId: v.id, type, filePath, mimeType: req.file.mimetype, originalName: req.file.originalname } });
  await prisma.vehicle.update({ where: { id: v.id }, data: { verified: false } });
  res.status(201).json({ id: doc.id, type: doc.type, status: doc.status });
});
app.delete('/api/vehicles/:id', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const v = await prisma.vehicle.findFirst({ where: { id: pathId(req), ownerId: u.id } }); if (!v) return res.status(404).json({ message: 'Vehicle not found' }); await prisma.vehicle.delete({ where: { id: v.id } }); res.status(204).end(); });

async function checkOfferEligibility(userId: string, vehicleId: string) {
  const policy = await safetyPolicy(); const kyc = await userKycComplete(userId); const ready = await vehicleReady(vehicleId);
  const license = await prisma.kycDocument.findFirst({ where: { userId, type: 'DRIVING_LICENSE', status: 'VERIFIED' } });
  if (policy.requireKycForOffering && !kyc) return 'Complete identity KYC before offering a ride.';
  if (!license) return 'Verify your driving licence before offering a ride.';
  if (!ready) return 'Vehicle must have verified RC and active insurance before offering a ride.';
  return null;
}

app.post('/api/rides', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req); const d = z.object({ vehicleId: z.string(), origin: z.string().trim().min(2).max(120), destination: z.string().trim().min(2).max(120), originLat: z.number().min(-90).max(90).optional(), originLng: z.number().min(-180).max(180).optional(), destinationLat: z.number().min(-90).max(90).optional(), destinationLng: z.number().min(-180).max(180).optional(), departureTime: z.string().datetime(), availableSeats: z.number().int().min(1).max(6), distanceKm: z.number().positive().max(2000).optional(), estimatedDurationMinutes: z.number().int().positive().max(1440).optional(), price: z.number().positive().max(100000), womenOnly: z.boolean().default(false) }).parse(req.body);
  const vehicle = await prisma.vehicle.findFirst({ where: { id: d.vehicleId, ownerId: u.id } }); if (!vehicle) return res.status(403).json({ message: 'Vehicle does not belong to you' });
  if (new Date(d.departureTime) <= new Date()) return res.status(400).json({ message: 'Departure time must be in the future.' });
  if (d.availableSeats > vehicle.seats - 1) return res.status(400).json({ message: `This vehicle supports at most ${Math.max(0, vehicle.seats - 1)} passenger seats.` });
  if ((d.distanceKm === undefined) !== (d.estimatedDurationMinutes === undefined)) return res.status(400).json({ message: 'Distance and estimated duration must be provided together.' });
  if (d.distanceKm !== undefined && d.estimatedDurationMinutes !== undefined) {
    const estimate = estimateSeatFare(vehicle.type, d.distanceKm, d.estimatedDurationMinutes);
    if (d.price < estimate.minimum || d.price > estimate.maximum) return res.status(400).json({ code: 'PRICE_OUT_OF_RANGE', message: `Set a per-seat fare between ₹${estimate.minimum} and ₹${estimate.maximum} for this route.`, estimate });
  }
  const error = await checkOfferEligibility(u.id, d.vehicleId); if (error) return res.status(403).json({ code: 'OFFER_NOT_ELIGIBLE', message: error });
  if (d.womenOnly && u.gender === 'MALE') return res.status(400).json({ message: 'Women-only rides must be hosted by a verified female host under the current safety policy.' });
  const ride = await prisma.$transaction(async tx => { const r = await tx.ride.create({ data: { ...d, departureTime: new Date(d.departureTime), hostId: u.id, price: d.price } }); await tx.trip.create({ data: { rideId: r.id } }); return r; });
  res.status(201).json(await prisma.ride.findUnique({ where: { id: ride.id }, include: { host: true, vehicle: true, trip: true } }));
});

app.get('/api/rides/search', auth, async (req: AuthReq, res) => {
  const q = z.object({ origin: z.string().optional(), destination: z.string().optional(), date: z.string().optional(), womenOnly: z.preprocess(value => value === 'true' ? true : value === 'false' ? false : value, z.boolean()).optional() }).parse(req.query);
  const start = q.date ? new Date(`${q.date}T00:00:00`) : new Date(); const end = q.date ? new Date(`${q.date}T23:59:59`) : new Date(Date.now() + 30 * 86400000);
  const where: any = { status: 'OPEN', departureTime: { gte: start, lte: end }, availableSeats: { gt: 0 } };
  if (q.origin) where.origin = { contains: q.origin, mode: 'insensitive' }; if (q.destination) where.destination = { contains: q.destination, mode: 'insensitive' }; if (q.womenOnly === true) where.womenOnly = true;
  res.json(await prisma.ride.findMany({ where, include: { host: true, vehicle: { include: { documents: { select: { type: true, status: true } } } }, trip: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: { select: { id: true, firstName: true, gender: true, verified: true } } } } }, orderBy: { departureTime: 'asc' }, take: 50 }));
});
app.get('/api/rides/popular', async (_, res) => {
  const rows = await prisma.ride.groupBy({ by: ['origin','destination'], where: { status: 'OPEN', departureTime: { gte: new Date() } }, _count: { id: true }, _avg: { price: true }, orderBy: { _count: { id: 'desc' } }, take: 12 });
  res.json(rows.map(r => ({ origin: r.origin, destination: r.destination, route: `${r.origin}→${r.destination}`, activeRides: r._count.id, avgPrice: r._avg.price ? Number(r._avg.price.toFixed(0)) : 0 })));
});
app.get('/api/rides/my', auth, async (req: AuthReq, res) => { const u = await dbUser(req); res.json(await prisma.ride.findMany({ where: { hostId: u.id }, include: { vehicle: true, host: true, trip: true, requests: { include: { rider: true } }, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true }, orderBy: { createdAt: 'asc' } } }, orderBy: { departureTime: 'desc' } })); });
app.get('/api/rides/:id', auth, async (req, res) => { const r = await prisma.ride.findUnique({ where: { id: pathId(req) }, include: { host: true, vehicle: true, trip: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: { select: { id: true, firstName: true, gender: true, verified: true, rating: true } } } } } }); if (!r) return res.status(404).json({ message: 'Ride not found' }); res.json(r); });

type BookingSafety = { ok: true } | { ok: false; status: number; code?: string; message: string };
async function checkBookingSafety(rideId: string, riderId: string, forAcceptance = false): Promise<BookingSafety> {
  const policy = await safetyPolicy(); const rider = await prisma.user.findUnique({ where: { id: riderId } });
  const ride = await prisma.ride.findUnique({ where: { id: rideId }, include: { host: true, vehicle: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } } });
  if (!rider || !ride) return { ok: false, status: 404, message: 'Ride not found' };
  if (policy.requireKycForBooking && !(await userKycComplete(riderId))) return { ok: false, status: 403, code: 'KYC_REQUIRED', message: 'Complete KYC before booking a ride.' };
  if (ride.womenOnly) {
    if (!policy.womenSafetyEnabled) return { ok: false, status: 400, message: 'Women-only mode is temporarily unavailable.' };
    if (rider.gender !== Gender.FEMALE) return { ok: false, status: 403, code: 'WOMEN_ONLY', message: 'This ride is reserved for women riders.' };
    if (policy.requireVerifiedHostForWomenOnly && (ride.host.gender !== Gender.FEMALE || ride.host.kycStatus !== KycStatus.VERIFIED)) return { ok: false, status: 409, code: 'WOMEN_SAFETY_HOST_REQUIRED', message: 'Women-only rides require a verified female host.' };
    if (policy.requireVerifiedVehicleForWomenOnly && !(await vehicleReady(ride.vehicleId))) return { ok: false, status: 409, code: 'VEHICLE_NOT_VERIFIED', message: 'The vehicle must be fully verified.' };
  }
  if (forAcceptance && policy.womenSafetyEnabled && policy.requireFemaleCompanionForSoloFemaleRider && ride.vehicle.type === 'CAR' && ride.host.gender !== Gender.FEMALE) {
    const femaleConfirmed = ride.bookings.filter(b => b.rider.gender === Gender.FEMALE).length;
    const confirmedRiders = ride.bookings.reduce((sum, b) => sum + b.seats, 0) + 1;
    const femaleAfterAcceptance = femaleConfirmed + (rider.gender === Gender.FEMALE ? 1 : 0);
    if (rider.gender === Gender.FEMALE && femaleConfirmed === 0) return { ok: false, status: 409, code: 'FEMALE_COMPANION_REQUIRED', message: 'Women Safety Mode requires another confirmed female rider or a verified female host for a female passenger travelling with a male host.' };
    if (confirmedRiders >= 4 && femaleAfterAcceptance < policy.femaleCompanionMinimum) return { ok: false, status: 409, code: 'FEMALE_COMPANION_MINIMUM', message: `For a carpool with four or more passenger seats, at least ${policy.femaleCompanionMinimum} female riders are required under the active Women Safety policy.` };
  }
  if (forAcceptance && policy.womenSafetyEnabled && rider.gender === Gender.FEMALE && ride.vehicle.type === 'BIKE' && ride.host.gender !== Gender.FEMALE) return { ok: false, status: 409, code: 'WOMEN_SAFETY_BIKE_RESTRICTION', message: 'For a female passenger on a bike, Women Safety Mode requires a verified female host.' };
  return { ok: true };
}

app.post('/api/rides/:id/request', auth, async (req: AuthReq, res: express.Response) => {
  const u = await dbUser(req); const seats = z.object({ seats: z.number().int().min(1).max(6).default(1) }).parse(req.body || {}).seats;
  const ride = await prisma.ride.findUnique({ where: { id: pathId(req) } }); if (!ride) return res.status(404).json({ message: 'Ride not found' }); if (ride.hostId === u.id) return res.status(400).json({ message: 'Host cannot request own ride' }); if (ride.availableSeats < seats) return res.status(400).json({ message: 'Not enough seats' });
  const safety = await checkBookingSafety(ride.id, u.id, false); if (!safety.ok) return res.status(safety.status).json({ code: safety.code, message: safety.message });
  const existing = await prisma.rideRequest.findUnique({ where: { rideId_riderId: { rideId: ride.id, riderId: u.id } } }); if (existing) return res.status(409).json({ message: 'Request already exists' });
  res.status(201).json(await prisma.rideRequest.create({ data: { rideId: ride.id, riderId: u.id, seats, safetyNote: ride.womenOnly ? 'Women Safety Mode' : null } }));
});
app.get('/api/requests/my', auth, async (req: AuthReq, res) => { const u = await dbUser(req); res.json(await prisma.rideRequest.findMany({ where: { riderId: u.id }, include: { ride: { include: { host: true, vehicle: true, trip: true } } }, orderBy: { createdAt: 'desc' } })); });
app.post('/api/requests/:id/accept', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req); const rr = await prisma.rideRequest.findUnique({ where: { id: pathId(req) }, include: { ride: { include: { host: true, vehicle: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } }, } } });
  if (!rr) return res.status(404).json({ message: 'Request not found' }); if (rr.ride.hostId !== u.id) return res.status(403).json({ message: 'Only host can accept' }); if (rr.status !== 'PENDING') return res.status(400).json({ message: 'Request is not pending' }); if (rr.ride.availableSeats < rr.seats) return res.status(400).json({ message: 'Not enough seats' });
  const safety = await checkBookingSafety(rr.rideId, rr.riderId, true); if (!safety.ok) return res.status(safety.status).json({ code: safety.code, message: safety.message });
  try {
    const result = await prisma.$transaction(async tx => {
      const seatUpdate = await tx.ride.updateMany({ where: { id: rr.rideId, availableSeats: { gte: rr.seats }, status: 'OPEN' }, data: { availableSeats: { decrement: rr.seats } } });
      if (seatUpdate.count !== 1) throw new Error('SEATS_UNAVAILABLE');
      const r = await tx.rideRequest.update({ where: { id: rr.id }, data: { status: 'ACCEPTED' } });
      const b = await tx.booking.create({ data: { rideId: rr.rideId, riderId: rr.riderId, requestId: rr.id, seats: rr.seats, amount: rr.ride.price * rr.seats, status: 'CONFIRMED' } });
      const remaining = await tx.ride.findUnique({ where: { id: rr.rideId }, select: { availableSeats: true } });
      if (remaining?.availableSeats === 0) {
        await tx.ride.update({ where: { id: rr.rideId }, data: { status: 'FULL' } });
        await tx.rideRequest.updateMany({ where: { rideId: rr.rideId, status: 'PENDING' }, data: { status: 'REJECTED' } });
      }
      return { request: r, booking: b };
    });
    res.json(result);
  } catch (e: any) {
    if (e?.message === 'SEATS_UNAVAILABLE') return res.status(409).json({ code: 'SEATS_UNAVAILABLE', message: 'Those seats were just taken. Refresh the ride and try another option.' });
    throw e;
  }
});
app.post('/api/requests/:id/reject', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const rr = await prisma.rideRequest.findUnique({ where: { id: pathId(req) }, include: { ride: true } }); if (!rr) return res.status(404).json({ message: 'Request not found' }); if (rr.ride.hostId !== u.id) return res.status(403).json({ message: 'Only host can reject' }); if (rr.status !== 'PENDING') return res.status(409).json({ message: 'Only pending requests can be rejected.' }); res.json(await prisma.rideRequest.update({ where: { id: rr.id }, data: { status: 'REJECTED' } })); });
app.get('/api/bookings/my', auth, async (req: AuthReq, res) => { const u = await dbUser(req); res.json(await prisma.booking.findMany({ where: { riderId: u.id }, include: { ride: { include: { host: true, vehicle: true, trip: true } } }, orderBy: { createdAt: 'desc' } })); });
app.get('/api/bookings/:id/payment', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const booking = await prisma.booking.findUnique({ where: { id: pathId(req) }, include: { ride: { include: { host: true, trip: true } }, commission: true } });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const isDriver = booking.ride.hostId === u.id;
  if (!isDriver && booking.riderId !== u.id) return res.status(403).json({ message: 'Only this ride’s driver or rider can view payment details.' });
  const commissionAmount = booking.commission?.commissionAmount ?? calculateCommission(booking.amount);
  res.json({
    ...booking,
    paymentMethod: 'CASH_DIRECT',
    commission: { grossAmount: booking.amount, rate: PLATFORM_COMMISSION_RATE, amount: commissionAmount, driverNet: booking.amount - commissionAmount },
    canConfirmCash: isDriver && booking.status === 'CONFIRMED' && booking.ride.trip?.status === 'COMPLETED' && booking.cashPaymentStatus === 'DUE',
  });
});
app.post('/api/bookings/:id/cash-collected', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const booking = await prisma.booking.findUnique({ where: { id: pathId(req) }, include: { ride: { include: { trip: true } } } });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.ride.hostId !== u.id) return res.status(403).json({ message: 'Only the driver can confirm direct payment.' });
  if (booking.status !== 'CONFIRMED' || booking.ride.trip?.status !== 'COMPLETED') return res.status(409).json({ message: 'Cash can only be confirmed after a confirmed trip is completed.' });
  try {
    const commission = await prisma.$transaction(async tx => {
      const claimed = await tx.booking.updateMany({ where: { id: booking.id, status: 'CONFIRMED', cashPaymentStatus: 'DUE' }, data: { cashPaymentStatus: 'CONFIRMED', cashCollectedAt: new Date() } });
      if (claimed.count !== 1) throw new Error('CASH_ALREADY_CONFIRMED');
      const amount = calculateCommission(booking.amount);
      return tx.commissionEntry.create({ data: { bookingId: booking.id, driverId: u.id, grossAmount: booking.amount, commissionRate: PLATFORM_COMMISSION_RATE, commissionAmount: amount } });
    });
    res.status(201).json({ cashPaymentStatus: 'CONFIRMED', commission });
  } catch (error: any) {
    if (error?.message === 'CASH_ALREADY_CONFIRMED' || error?.code === 'P2002') return res.status(409).json({ message: 'Cash collection has already been confirmed.' });
    throw error;
  }
});
app.post('/api/bookings/:id/cancel', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const booking = await prisma.booking.findFirst({ where: { id: pathId(req), riderId: u.id }, include: { ride: { include: { trip: true } } } });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.status !== 'CONFIRMED') return res.status(409).json({ message: 'Only confirmed bookings can be cancelled.' });
  if (booking.ride.trip?.status === 'IN_PROGRESS' || booking.ride.trip?.status === 'COMPLETED') return res.status(409).json({ message: 'A trip that has started cannot be cancelled.' });
  const result = await prisma.$transaction(async tx => {
    const changed = await tx.booking.updateMany({ where: { id: booking.id, status: 'CONFIRMED' }, data: { status: 'CANCELLED' } });
    if (changed.count !== 1) throw new Error('BOOKING_ALREADY_CHANGED');
    await tx.ride.update({ where: { id: booking.rideId }, data: { availableSeats: { increment: booking.seats }, status: 'OPEN' } });
    if (booking.requestId) await tx.rideRequest.update({ where: { id: booking.requestId }, data: { status: 'CANCELLED' } });
    return tx.booking.findUnique({ where: { id: booking.id } });
  });
  res.json(result);
});

async function canTrip(uId: string, tripId: string) { return prisma.trip.findUnique({ where: { id: tripId }, include: { ride: { include: { host: true, vehicle: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } } }, locations: { orderBy: { timestamp: 'desc' }, take: 200 } } }); }
app.get('/api/trips/my', auth, async (req: AuthReq, res) => { const u = await dbUser(req); res.json(await prisma.trip.findMany({ where: { OR: [{ ride: { is: { hostId: u.id } } }, { ride: { is: { bookings: { some: { riderId: u.id, status: 'CONFIRMED' } } } } }] }, include: { ride: { include: { host: true, vehicle: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } } }, locations: { orderBy: { timestamp: 'desc' }, take: 20 } }, orderBy: { createdAt: 'desc' } })); });
app.get('/api/trips/:id', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const t = await canTrip(u.id, pathId(req)); if (!t) return res.status(404).json({ message: 'Trip not found' }); const allowed = t.ride.hostId === u.id || t.ride.bookings.some(b => b.riderId === u.id); if (!allowed) return res.status(403).json({ message: 'Not allowed' }); res.json(t); });
app.get('/api/trips/:id/messages', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const tripId = pathId(req);
  const trip = await canTrip(u.id, tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  const allowed = trip.ride.hostId === u.id || trip.ride.bookings.some(booking => booking.riderId === u.id);
  if (!allowed) return res.status(403).json({ message: 'Only confirmed trip participants can view trip messages.' });
  res.json(await prisma.tripMessage.findMany({ where: { tripId }, include: { sender: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'asc' }, take: 200 }));
});
app.post('/api/trips/:id/messages', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const tripId = pathId(req);
  const body = z.object({ body: z.string().trim().min(1).max(1000) }).parse(req.body);
  const trip = await canTrip(u.id, tripId);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  const allowed = trip.ride.hostId === u.id || trip.ride.bookings.some(booking => booking.riderId === u.id);
  if (!allowed) return res.status(403).json({ message: 'Only confirmed trip participants can send messages.' });
  if (trip.status === 'CANCELLED') return res.status(409).json({ message: 'Messages are unavailable for cancelled trips.' });
  const message = await prisma.tripMessage.create({ data: { tripId, senderId: u.id, body: body.body }, include: { sender: { select: { id: true, firstName: true, lastName: true } } } });
  io.to(`trip_${tripId}`).emit('trip:chat', message);
  res.status(201).json(message);
});
app.post('/api/trips/:id/start', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const t = await canTrip(u.id, pathId(req)); if (!t) return res.status(404).json({ message: 'Trip not found' }); if (t.ride.hostId !== u.id) return res.status(403).json({ message: 'Only host can start' }); if (t.status !== 'SCHEDULED') return res.status(400).json({ message: 'Invalid state' }); if (!(await userKycComplete(u.id)) || !(await vehicleReady(t.ride.vehicleId))) return res.status(403).json({ message: 'Host and vehicle verification must be complete before starting the trip.' }); const out = await prisma.trip.update({ where: { id: t.id }, data: { status: 'IN_PROGRESS', startedAt: new Date() } }); io.to(`trip_${t.id}`).emit('trip:status', { status: 'IN_PROGRESS' }); res.json(out); });
app.post('/api/trips/:id/complete', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const t = await canTrip(u.id, pathId(req)); if (!t) return res.status(404).json({ message: 'Trip not found' }); if (t.ride.hostId !== u.id) return res.status(403).json({ message: 'Only host can complete' }); if (t.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Invalid state' }); const out = await prisma.$transaction(async tx => { const completed = await tx.trip.update({ where: { id: t.id }, data: { status: 'COMPLETED', completedAt: new Date() } }); await tx.ride.update({ where: { id: t.rideId }, data: { status: 'COMPLETED' } }); return completed; }); io.to(`trip_${t.id}`).emit('trip:status', { status: 'COMPLETED' }); res.json(out); });
app.post('/api/trips/:id/cancel', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const t = await canTrip(u.id, pathId(req)); if (!t) return res.status(404).json({ message: 'Trip not found' }); if (t.ride.hostId !== u.id) return res.status(403).json({ message: 'Only host can cancel' }); if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return res.status(400).json({ message: 'Invalid state' }); const out = await prisma.trip.update({ where: { id: t.id }, data: { status: 'CANCELLED' } }); io.to(`trip_${t.id}`).emit('trip:status', { status: 'CANCELLED' }); res.json(out); });
app.post('/api/trips/:id/location', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const d = locationSchema.parse(req.body); const t = await canTrip(u.id, pathId(req)); if (!t) return res.status(404).json({ message: 'Trip not found' }); if (t.status !== 'IN_PROGRESS') return res.status(400).json({ message: 'Trip is not in progress' }); const host = t.ride.hostId === u.id; const rider = t.ride.bookings.some(b => b.riderId === u.id); if (!host && !rider) return res.status(403).json({ message: 'Not allowed to publish location' }); const role: LocationRole = host ? 'HOST' : 'RIDER'; const loc = await prisma.tripLocation.create({ data: { tripId: t.id, userId: u.id, role, latitude: d.latitude, longitude: d.longitude, accuracy: d.accuracy, heading: d.heading, speed: d.speed, timestamp: new Date(d.timestamp) } }); const payload = { ...d, userId: u.id, role, tripId: t.id }; io.to(`trip_${t.id}`).emit('location:update', payload); io.to('admin_live').emit('location:update', payload); res.status(201).json(loc); });

app.post('/api/safety/emergency-contacts', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const d = z.object({ name: z.string().min(2), phone: z.string().min(8).max(20), relation: z.string().max(40).optional() }).parse(req.body); res.status(201).json(await prisma.emergencyContact.create({ data: { ...d, userId: u.id } })); });
app.get('/api/safety/emergency-contacts', auth, async (req: AuthReq, res) => { const u = await dbUser(req); res.json(await prisma.emergencyContact.findMany({ where: { userId: u.id } })); });
app.post('/api/safety/sos', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const d = z.object({ tripId: z.string().optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), message: z.string().max(500).optional() }).parse(req.body); const event = await prisma.sosEvent.create({ data: { ...d, userId: u.id } }); io.to('admin_live').emit('safety:sos', { id:event.id, userId:u.id, tripId:event.tripId, latitude:event.latitude, longitude:event.longitude, message:event.message, createdAt:event.createdAt }); if(event.tripId) io.to(`trip_${event.tripId}`).emit('safety:sos', { id:event.id, userId:u.id, tripId:event.tripId, message:event.message, createdAt:event.createdAt }); res.status(201).json(event); });
app.post('/api/safety/report', auth, async (req: AuthReq, res) => { const u = await dbUser(req); const d = z.object({ tripId: z.string().optional(), category: z.string().min(2), description: z.string().min(5).max(2000) }).parse(req.body); res.status(201).json(await prisma.safetyReport.create({ data: { ...d, reporterId: u.id } })); });
app.get('/api/safety/policy', auth, async (_, res) => res.json(await safetyPolicy()));

async function driverCommissionDue(driverId: string) {
  const [entries, remittances] = await Promise.all([
    prisma.commissionEntry.aggregate({ where: { driverId }, _sum: { commissionAmount: true } }),
    prisma.commissionRemittance.aggregate({ where: { driverId, status: 'VERIFIED' }, _sum: { amount: true } }),
  ]);
  return Math.max(0, Number(entries._sum.commissionAmount || 0) - Number(remittances._sum.amount || 0));
}

app.get('/api/wallet/earnings', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const [entries, remittances] = await Promise.all([
    prisma.commissionEntry.findMany({ where: { driverId: u.id }, include: { booking: { include: { ride: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.commissionRemittance.findMany({ where: { driverId: u.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const thisWeek = entries.filter(entry => entry.createdAt >= startOfWeek);
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(startOfWeek);
    start.setDate(start.getDate() - (5 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const matching = entries.filter(entry => entry.createdAt >= start && entry.createdAt < end);
    const gross = matching.reduce((sum, entry) => sum + entry.grossAmount, 0);
    const commission = matching.reduce((sum, entry) => sum + entry.commissionAmount, 0);
    return { label: start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), gross, commission, net: gross - commission };
  });
  const gross = thisWeek.reduce((sum, entry) => sum + entry.grossAmount, 0);
  const commission = thisWeek.reduce((sum, entry) => sum + entry.commissionAmount, 0);
  res.json({
    thisWeek: { gross, commission, net: gross - commission, trips: thisWeek.length },
    available: 0,
    pending: await driverCommissionDue(u.id),
    weeks,
    payouts: remittances,
    payoutCycle: 'MANUAL_REMITTANCE',
    commissionRate: PLATFORM_COMMISSION_RATE,
  });
});
app.get('/api/wallet', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const [entries, remittances, due] = await Promise.all([
    prisma.commissionEntry.findMany({ where: { driverId: u.id }, include: { booking: { include: { ride: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.commissionRemittance.findMany({ where: { driverId: u.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
    driverCommissionDue(u.id),
  ]);
  const transactions = [
    ...entries.map(entry => ({ id: entry.id, amount: -entry.commissionAmount, type: 'PLATFORM_COMMISSION', status: 'ACCRUED', reference: `${entry.booking.ride.origin} → ${entry.booking.ride.destination}`, createdAt: entry.createdAt })),
    ...remittances.map(item => ({ id: item.id, amount: item.status === 'VERIFIED' ? item.amount : 0, type: 'PLATFORM_REMITTANCE', status: item.status, reference: item.externalReference, createdAt: item.createdAt })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json({ balance: -due, due, commissionRate: PLATFORM_COMMISSION_RATE, transactions });
});
app.post('/api/wallet/commission-remittances', auth, async (req: AuthReq, res) => {
  const u = await dbUser(req);
  const d = z.object({ amount: z.number().positive().max(1000000), externalReference: z.string().trim().min(4).max(120) }).parse(req.body);
  const [due, pending] = await Promise.all([
    driverCommissionDue(u.id),
    prisma.commissionRemittance.aggregate({ where: { driverId: u.id, status: 'PENDING' }, _sum: { amount: true } }),
  ]);
  const outstanding = due - Number(pending._sum.amount || 0);
  if (d.amount > outstanding) return res.status(400).json({ message: `The maximum amount you can submit is ₹${Math.max(0, outstanding).toFixed(2)}.` });
  if (outstanding <= 0) return res.status(409).json({ message: 'There are no unsubmitted platform commission dues.' });
  res.status(201).json(await prisma.commissionRemittance.create({ data: { driverId: u.id, amount: d.amount, externalReference: d.externalReference } }));
});

app.get('/api/admin/overview', admin, async (_, res) => {
  const [users, rides, bookings, completedTrips, activeTrips, pendingKyc, pendingKycDocs, pendingVehicleDocs, reports, commissions, verifiedRemittances, pendingRemittances] = await Promise.all([
    prisma.user.count(), prisma.ride.count(), prisma.booking.count(), prisma.trip.count({ where: { status: 'COMPLETED' } }),
    prisma.trip.count({ where: { status: 'IN_PROGRESS' } }), prisma.user.count({ where: { kycStatus: 'PENDING' } }),
    prisma.kycDocument.count({ where: { status: 'PENDING' } }), prisma.vehicleDocument.count({ where: { status: 'PENDING' } }),
    prisma.safetyReport.count({ where: { status: 'OPEN' } }), prisma.commissionEntry.aggregate({ _sum: { commissionAmount: true } }),
    prisma.commissionRemittance.aggregate({ where: { status: 'VERIFIED' }, _sum: { amount: true } }),
    prisma.commissionRemittance.count({ where: { status: 'PENDING' } }),
  ]);
  res.json({
    users, rides, bookings, completedTrips, activeTrips, pendingKyc,
    pendingDocs: pendingKycDocs + pendingVehicleDocs, openSafetyReports: reports,
    commissionDue: Math.max(0, Number(commissions._sum.commissionAmount || 0) - Number(verifiedRemittances._sum.amount || 0)),
    pendingRemittances,
  });
});
app.get('/api/admin/users', admin, async (_, res) => res.json(await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { vehicles: { include: { documents: true } }, documents: true } })));
app.patch('/api/admin/users/:id/status', admin, async (req, res) => { const d = z.object({ isActive: z.boolean() }).parse(req.body); res.json(await prisma.user.update({ where: { id: pathId(req) }, data: { isActive: d.isActive } })); });
app.get('/api/admin/kyc', admin, async (_, res) => res.json(await prisma.kycDocument.findMany({ where: { status: 'PENDING' }, include: { user: true }, orderBy: { createdAt: 'asc' }, take: 200 })));
app.patch('/api/admin/kyc/:id', admin, async (req: AuthReq, res) => { const d = z.object({ status: z.enum(['VERIFIED','REJECTED']), rejectionReason: z.string().max(500).optional() }).parse(req.body); const doc = await prisma.kycDocument.update({ where: { id: pathId(req) }, data: { status: d.status, rejectionReason: d.rejectionReason, reviewedBy: req.user!.uid, reviewedAt: new Date() } }); const all = await prisma.kycDocument.findMany({ where: { userId: doc.userId } }); const identity = all.some(x => x.type === 'IDENTITY' && x.status === 'VERIFIED'); const selfie = all.some(x => x.type === 'SELFIE' && x.status === 'VERIFIED'); const rejected = all.some(x => x.status === 'REJECTED'); await prisma.user.update({ where: { id: doc.userId }, data: { kycStatus: identity && selfie ? 'VERIFIED' : rejected ? 'REJECTED' : 'PENDING', verified: identity && selfie, kycVerifiedAt: identity && selfie ? new Date() : null } }); res.json(doc); });
app.get('/api/admin/kyc/:id/file', admin, async (req, res) => { const doc = await prisma.kycDocument.findUnique({ where: { id: pathId(req) } }); if (!doc) return res.status(404).json({ message: 'Document not found' }); await sendStoredDocument(res, doc.filePath); });
app.get('/api/admin/vehicle-documents', admin, async (_, res) => res.json(await prisma.vehicleDocument.findMany({ where: { status: 'PENDING' }, include: { vehicle: { include: { owner: true } } }, orderBy: { createdAt: 'asc' }, take: 200 })));
app.patch('/api/admin/vehicle-documents/:id', admin, async (req: AuthReq, res) => { const d = z.object({ status: z.enum(['VERIFIED','REJECTED']), rejectionReason: z.string().max(500).optional() }).parse(req.body); const doc = await prisma.vehicleDocument.update({ where: { id: pathId(req) }, data: { status: d.status, rejectionReason: d.rejectionReason, reviewedBy: req.user!.uid, reviewedAt: new Date() } }); const all = await prisma.vehicleDocument.findMany({ where: { vehicleId: doc.vehicleId } }); const rc = all.some(x => x.type === 'RC' && x.status === 'VERIFIED'); const insurance = all.some(x => x.type === 'INSURANCE' && x.status === 'VERIFIED'); await prisma.vehicle.update({ where: { id: doc.vehicleId }, data: { verified: rc && insurance } }); res.json(doc); });
app.get('/api/admin/vehicle-documents/:id/file', admin, async (req, res) => { const doc = await prisma.vehicleDocument.findUnique({ where: { id: pathId(req) } }); if (!doc) return res.status(404).json({ message: 'Document not found' }); await sendStoredDocument(res, doc.filePath); });
app.get('/api/admin/rides', admin, async (_, res) => res.json(await prisma.ride.findMany({ orderBy: { departureTime: 'desc' }, take: 200, include: { host: true, vehicle: true, trip: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } } })));
app.patch('/api/admin/rides/:id/status', admin, async (req, res) => { const d = z.object({ status: z.enum(['OPEN','FULL','CANCELLED','COMPLETED']) }).parse(req.body); res.json(await prisma.ride.update({ where: { id: pathId(req) }, data: { status: d.status } })); });
app.get('/api/admin/live', admin, async (_, res) => res.json(await prisma.trip.findMany({ where: { status: 'IN_PROGRESS' }, include: { ride: { include: { host: true, vehicle: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } } }, locations: { orderBy: { timestamp: 'desc' }, take: 200 } } })));
app.get('/api/admin/sos', admin, async (_, res) => res.json(await prisma.sosEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { user: true } })));
app.patch('/api/admin/sos/:id', admin, async (req, res) => { const d = z.object({ status: z.enum(['OPEN','ACKNOWLEDGED','RESOLVED']) }).parse(req.body); res.json(await prisma.sosEvent.update({ where: { id:pathId(req) }, data:d })); });
app.get('/api/admin/reports', admin, async (_, res) => res.json(await prisma.safetyReport.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { reporter: true } })));
app.patch('/api/admin/reports/:id', admin, async (req, res) => { const d = z.object({ status: z.enum(['OPEN','INVESTIGATING','RESOLVED']) }).parse(req.body); res.json(await prisma.safetyReport.update({ where: { id: pathId(req) }, data: { status: d.status } })); });
app.get('/api/admin/safety-policy', admin, async (_, res) => res.json(await safetyPolicy()));
app.patch('/api/admin/safety-policy', admin, async (req, res) => { const d = z.object({ womenSafetyEnabled: z.boolean(), requireVerifiedHostForWomenOnly: z.boolean(), requireVerifiedVehicleForWomenOnly: z.boolean(), requireFemaleCompanionForSoloFemaleRider: z.boolean(), femaleCompanionMinimum: z.number().int().min(1).max(6), requireKycForBooking: z.boolean(), requireKycForOffering: z.boolean() }).parse(req.body); res.json(await prisma.safetyPolicy.upsert({ where: { id: 'default' }, update: d, create: { id: 'default', ...d } })); });
app.get('/api/admin/commission-remittances', admin, async (_, res) => res.json(await prisma.commissionRemittance.findMany({ include: { driver: true }, orderBy: { createdAt: 'asc' }, take: 200 })));
app.patch('/api/admin/commission-remittances/:id', admin, async (req: AuthReq, res) => {
  const d = z.object({ status: z.enum(['VERIFIED', 'REJECTED']) }).parse(req.body);
  const remittanceId = pathId(req);
  const item = await prisma.commissionRemittance.findUnique({ where: { id: remittanceId } });
  if (!item) return res.status(404).json({ message: 'Commission remittance not found.' });
  if (item.status !== 'PENDING') return res.status(409).json({ message: 'Only pending remittances can be reviewed.' });
  if (d.status === 'VERIFIED') {
    const [commissions, alreadyVerified] = await Promise.all([
      prisma.commissionEntry.aggregate({ where: { driverId: item.driverId }, _sum: { commissionAmount: true } }),
      prisma.commissionRemittance.aggregate({ where: { driverId: item.driverId, status: 'VERIFIED' }, _sum: { amount: true } }),
    ]);
    if (Number(alreadyVerified._sum.amount || 0) + item.amount > Number(commissions._sum.commissionAmount || 0) + 0.005) {
      return res.status(409).json({ message: 'This remittance would exceed the driver’s recorded commission balance.' });
    }
  }
  const updated = await prisma.commissionRemittance.updateMany({
    where: { id: remittanceId, status: 'PENDING' },
    data: { status: d.status, reviewedBy: req.user!.uid, reviewedAt: new Date() },
  });
  if (updated.count !== 1) return res.status(409).json({ message: 'This remittance was already reviewed.' });
  res.json(await prisma.commissionRemittance.findUnique({ where: { id: remittanceId }, include: { driver: true } }));
});

io.use(async (socket, next) => { try { const token = socket.handshake.auth?.token; if (!token) throw new Error('missing'); const decoded = await getAuth().verifyIdToken(token); socket.data.uid = decoded.uid; socket.data.isAdmin = decoded.admin === true || (process.env.ADMIN_UIDS || '').split(',').map(x => x.trim()).includes(decoded.uid); next(); } catch { next(new Error('Unauthorized')); } });
io.on('connection', socket => {
  socket.on('joinAdminLive', async (ack?: (v: any) => void) => { if (!socket.data.isAdmin) return ack?.({ ok: false, message: 'Admin access required' }); socket.join('admin_live'); const active = await prisma.trip.findMany({ where: { status: 'IN_PROGRESS' }, include: { ride: { include: { host: true, bookings: { where: { status: 'CONFIRMED' }, include: { rider: true } } } }, locations: { orderBy: { timestamp: 'desc' }, take: 200 } } }); socket.emit('admin:liveSnapshot', active); ack?.({ ok: true }); });
  socket.on('joinTrip', async (tripId: string, ack?: (v: any) => void) => { try { const u = await prisma.user.findUnique({ where: { firebaseUid: socket.data.uid } }); if (!u) throw new Error('User not found'); const t = await canTrip(u.id, tripId); if (!t) throw new Error('Trip not found'); const allowed = t.ride.hostId === u.id || t.ride.bookings.some(b => b.riderId === u.id); if (!allowed) throw new Error('Not allowed'); socket.join(`trip_${tripId}`); socket.emit('location:snapshot', t.locations); ack?.({ ok: true }); } catch (e: any) { ack?.({ ok: false, message: e.message }); } });
  socket.on('leaveTrip', (tripId: string) => socket.leave(`trip_${tripId}`));
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof z.ZodError) return res.status(400).json({ message: 'Invalid request data.', issues: err.issues });
  if (err instanceof OmniRouteError) return res.status(err.statusCode).json({ message: err.message });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Document is too large. Maximum size is 8 MB.' });
  if (err?.message?.includes('Only JPG')) return res.status(400).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT || 3001);
httpServer.listen(port, () => console.log(`WayMate API listening on ${port}`));
