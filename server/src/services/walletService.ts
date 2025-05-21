import { prisma } from '../db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class WalletService {
  static async updateBalance(userId: number, amount: number, isIncrement: boolean) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    if (!isIncrement && wallet.balance < amount) {
      throw new BadRequestError('Insufficient balance');
    }

    return prisma.wallet.update({
      where: { userId },
      data: {
        balance: isIncrement 
          ? { increment: amount }
          : { decrement: amount }
      }
    });
  }

  static async transferBalance(fromUserId: number, toUserId: number, amount: number) {
    return prisma.$transaction(async (prisma) => {
      // Deduct from sender
      const fromWallet = await prisma.wallet.findUnique({
        where: { userId: fromUserId }
      });

      if (!fromWallet) {
        throw new NotFoundError('Sender wallet not found');
      }

      if (fromWallet.balance < amount) {
        throw new BadRequestError('Insufficient balance');
      }

      await prisma.wallet.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: amount } }
      });

      // Add to receiver
      const toWallet = await prisma.wallet.findUnique({
        where: { userId: toUserId }
      });

      if (!toWallet) {
        throw new NotFoundError('Receiver wallet not found');
      }

      await prisma.wallet.update({
        where: { userId: toUserId },
        data: { balance: { increment: amount } }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          type: 'MARKETPLACE',
          status: 'COMPLETED',
          fromUserId,
          toUserId,
          description: `Wallet transfer from user ${fromUserId} to user ${toUserId}`,
        }
      });

      return transaction;
    });
  }

  static async getBalance(userId: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return wallet.balance;
  }
} 