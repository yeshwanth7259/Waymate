import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    phone_number?: string;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (!auth) {
      if (process.env.NODE_ENV === 'development') {
        // Fallback for development without Firebase credentials
        console.warn("Using unsafe token decoding for development");
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        
        req.user = {
          uid: decodedPayload?.user_id || 'mock-user-id',
          phone_number: decodedPayload?.phone_number
        };
        return next();
      }
      throw new Error("Firebase auth not initialized");
    }
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      phone_number: decodedToken.phone_number,
    };
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};
