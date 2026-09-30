import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const walletController = {
  getDriverEarnings: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      let wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: { transactions: { orderBy: { createdAt: 'desc' } } }
      });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId },
          include: { transactions: true }
        });
      }

      // Calculate mock graph data for the last 6 weeks (as per spec)
      const weeks = [1200, 1800, 1500, 2400, 3200, 4850];
      
      const response = {
        thisWeek: {
          gross: 5400,
          commission: 550,
          net: 4850,
          trips: 8
        },
        available: wallet.balance,
        pending: 1200,
        weeks: weeks,
        payouts: wallet.transactions.filter((t: any) => t.type === 'WITHDRAWAL'),
        nextPayoutDate: '2026-10-05T00:00:00Z',
        payoutCycle: 'WEEKLY'
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getWallet: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      let wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: { transactions: true }
      });
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId },
          include: { transactions: true }
        });
      }
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateBankInfo: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { bankInfo } = req.body;
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: { bankInfo }
      });
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  processPayout: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { amount } = req.body;
      
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      if (wallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

      // In a real app, integrate RazorpayX or Stripe Connect here.
      // We will deduct balance and record transaction.
      const transaction = await prisma.$transaction(async (tx) => {
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: { balance: { decrement: amount } }
        });
        const txn = await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: -amount,
            type: 'WITHDRAWAL',
            status: 'COMPLETED'
          }
        });
        return { wallet: updatedWallet, transaction: txn };
      });

      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
