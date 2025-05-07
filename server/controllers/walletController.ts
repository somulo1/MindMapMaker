import { Request, Response } from "express";
import { storage } from "../storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

// Get user's personal wallet
export async function getUserWallet(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const wallet = await storage.getUserWallet(userId);
  
  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }
  
  return res.status(200).json({ wallet });
}

// Get chama wallet
export async function getChamaWallet(req: Request, res: Response) {
  const chamaId = parseInt(req.params.chamaId);
  const userId = (req.user as any).id;
  
  // Verify chama exists
  const chama = await storage.getChama(chamaId);
  if (!chama) {
    return res.status(404).json({ message: "Chama not found" });
  }
  
  // Verify user is a member of the chama
  const membership = await storage.getChamaMember(chamaId, userId);
  if (!membership) {
    return res.status(403).json({ message: "You are not a member of this chama" });
  }
  
  const wallet = await storage.getChamaWallet(chamaId);
  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }
  
  return res.status(200).json({ wallet });
}

// Create transaction
export async function createTransaction(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const transactionSchema = z.object({
    type: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
    chamaId: z.number().optional(),
    destinationUserId: z.number().optional(),
    destinationChamaId: z.number().optional()
  });
  
  const validatedData = transactionSchema.parse(req.body);
  
  // Get user wallet (source)
  const userWallet = await storage.getUserWallet(userId);
  if (!userWallet) {
    return res.status(404).json({ message: "User wallet not found" });
  }
  
  // Handle transaction based on type
  let transaction;
  
  switch(validatedData.type) {
    case "deposit":
      // Add money to user wallet (simulating M-Pesa deposit)
      transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount: validatedData.amount,
        description: validatedData.description || "Deposit",
        destinationWallet: userWallet.id,
        status: "completed"
      });
      break;
      
    case "withdraw":
      // Check balance
      if (userWallet.balance < validatedData.amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount: validatedData.amount,
        description: validatedData.description || "Withdrawal",
        sourceWallet: userWallet.id,
        status: "completed"
      });
      break;
      
    case "transfer":
      // Check balance
      if (userWallet.balance < validatedData.amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Determine destination wallet
      let destinationWalletId;
      
      if (validatedData.destinationUserId) {
        const destUserWallet = await storage.getUserWallet(validatedData.destinationUserId);
        if (!destUserWallet) {
          return res.status(404).json({ message: "Destination user wallet not found" });
        }
        destinationWalletId = destUserWallet.id;
      } else if (validatedData.destinationChamaId) {
        const destChamaWallet = await storage.getChamaWallet(validatedData.destinationChamaId);
        if (!destChamaWallet) {
          return res.status(404).json({ message: "Destination chama wallet not found" });
        }
        destinationWalletId = destChamaWallet.id;
        
        // Verify user is a member of the chama
        const membership = await storage.getChamaMember(validatedData.destinationChamaId, userId);
        if (!membership) {
          return res.status(403).json({ message: "You are not a member of this chama" });
        }
      } else {
        return res.status(400).json({ message: "Destination not specified" });
      }
      
      transaction = await storage.createTransaction({
        userId,
        chamaId: validatedData.chamaId || validatedData.destinationChamaId,
        type: "transfer",
        amount: validatedData.amount,
        description: validatedData.description || "Transfer",
        sourceWallet: userWallet.id,
        destinationWallet: destinationWalletId,
        status: "completed"
      });
      break;
      
    case "contribution":
      if (!validatedData.chamaId) {
        return res.status(400).json({ message: "Chama ID is required for contributions" });
      }
      
      // Check balance
      if (userWallet.balance < validatedData.amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Verify chama exists
      const chama = await storage.getChama(validatedData.chamaId);
      if (!chama) {
        return res.status(404).json({ message: "Chama not found" });
      }
      
      // Verify user is a member of the chama
      const membership = await storage.getChamaMember(validatedData.chamaId, userId);
      if (!membership) {
        return res.status(403).json({ message: "You are not a member of this chama" });
      }
      
      const chamaWallet = await storage.getChamaWallet(validatedData.chamaId);
      if (!chamaWallet) {
        return res.status(404).json({ message: "Chama wallet not found" });
      }
      
      transaction = await storage.createTransaction({
        userId,
        chamaId: validatedData.chamaId,
        type: "contribution",
        amount: validatedData.amount,
        description: validatedData.description || "Chama Contribution",
        sourceWallet: userWallet.id,
        destinationWallet: chamaWallet.id,
        status: "completed"
      });
      break;
      
    default:
      return res.status(400).json({ message: "Invalid transaction type" });
  }
  
  // Get updated wallet info after transaction
  const updatedUserWallet = await storage.getUserWallet(userId);
  
  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction,
    wallet: updatedUserWallet
  });
}

// Get user's transactions
export async function getUserTransactions(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const transactions = await storage.getUserTransactions(userId);
  
  return res.status(200).json({ transactions });
}

// Get chama transactions
export async function getChamaTransactions(req: Request, res: Response) {
  const chamaId = parseInt(req.params.chamaId);
  const userId = (req.user as any).id;
  
  // Verify chama exists
  const chama = await storage.getChama(chamaId);
  if (!chama) {
    return res.status(404).json({ message: "Chama not found" });
  }
  
  // Verify user is a member of the chama
  const membership = await storage.getChamaMember(chamaId, userId);
  if (!membership) {
    return res.status(403).json({ message: "You are not a member of this chama" });
  }
  
  const transactions = await storage.getChamaTransactions(chamaId);
  
  return res.status(200).json({ transactions });
}
