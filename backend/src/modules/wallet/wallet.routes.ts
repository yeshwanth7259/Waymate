import { Router } from 'express';
import { walletController } from './wallet.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', walletController.getWallet);
router.get('/earnings', walletController.getDriverEarnings);
router.put('/bank', walletController.updateBankInfo);
router.post('/payout', walletController.processPayout);

export default router;
