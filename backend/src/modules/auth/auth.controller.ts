import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const syncUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const phone = req.user?.phone_number;

    if (!firebaseUid || !phone) {
      res.status(400).json({ error: 'Missing firebase UID or phone in token' });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { profile: true }
    });

    // If not, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid,
          phone,
          profile: {
            create: {} // Create an empty profile connected to the user
          }
        },
        include: { profile: true }
      });
    }

    res.json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ message: 'Auth Me endpoint', uid: req.user?.uid });
};
