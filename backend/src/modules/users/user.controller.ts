import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    let user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { profile: true, vehicles: true }
    });

    if (!user) { 
        const phone = req.user?.phone_number || '';
        const existingUserByPhone = await prisma.user.findUnique({ where: { phone } });
        if (existingUserByPhone) {
            user = await prisma.user.update({
                where: { phone },
                data: { firebaseUid },
                include: { profile: true, vehicles: true }
            });
        } else {
            user = await prisma.user.create({
                data: { firebaseUid, phone, profile: { create: {} } },
                include: { profile: true, vehicles: true }
            });
        }
    }
    if (user.profile) {
      const parts = (user.profile.fullName || '').split(' ');
      (user as any).firstName = parts[0] || '';
      (user as any).lastName = parts.slice(1).join(' ') || '';
      (user as any).gender = user.profile.gender || '';
    }
    res.json(user);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { firstName, lastName, gender, city, bio, occupation, email } = req.body;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;

    let user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) { 
        const phone = req.user?.phone_number || '';
        const existingUserByPhone = await prisma.user.findUnique({ where: { phone } });
        if (existingUserByPhone) {
            user = await prisma.user.update({
                where: { phone },
                data: { firebaseUid }
            });
        } else {
            user = await prisma.user.create({
                data: { firebaseUid, phone, profile: { create: {} } }
            });
        }
    }

    // Update Email on User
    if (email) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email }
      });
    }

    // Update Profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: { fullName, gender, city, bio, occupation }
    });

    res.json({ message: 'Profile updated', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
