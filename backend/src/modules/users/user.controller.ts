import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { profile: true, vehicles: true }
    });

    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { fullName, gender, city, bio, occupation, email } = req.body;

    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

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
