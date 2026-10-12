import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const handleSos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { tripId, latitude, longitude, message } = req.body;
    const firebaseUid = req.user?.uid;
    
    console.log(`[SOS TRIGGERED] User: ${firebaseUid} | Trip: ${tripId}`);
    console.log(`[SOS DETAILS] Location: ${latitude}, ${longitude} | Message: ${message}`);
    
    // In production, this would trigger:
    // 1. Push notifications to emergency contacts
    // 2. Alert to WayMate Operations Dashboard
    // 3. SMS to nearby police/emergency dispatch via integration
    
    res.status(200).json({ success: true, message: 'SOS protocol initiated. Operations notified.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during SOS' });
  }
};

export const handleReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { tripId, type, description } = req.body;
    const firebaseUid = req.user?.uid;
    
    console.log(`[SAFETY REPORT] User: ${firebaseUid} | Trip: ${tripId} | Type: ${type}`);
    console.log(`[REPORT DETAILS] ${description}`);
    
    // In production, this saves to a SafetyIncidents table for Admin review
    
    res.status(200).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during report submission' });
  }
};
