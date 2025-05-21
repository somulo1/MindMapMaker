import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { User, ChamaMember, Chama } from "@shared/schema";

// Get all users
export async function getUsers(req: Request, res: Response) {
  const users = await storage.getAllUsers();
  
  // Remove sensitive information
  const safeUsers = users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  
  return res.status(200).json({ users: safeUsers });
}

// Get user statistics
export async function getUserStats(req: Request, res: Response) {
  const users = await storage.getAllUsers();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const stats = {
    total: users.length,
    active: users.filter(user => user.lastActive && new Date(user.lastActive) > sevenDaysAgo).length,
    admins: users.filter(user => user.role === "admin").length,
    newLastWeek: users.filter(user => new Date(user.createdAt) > sevenDaysAgo).length
  };
  
  return res.status(200).json(stats);
}

// Update user
export async function updateUser(req: Request, res: Response) {
  const userId = parseInt(req.params.id);
  
  const updateSchema = z.object({
    username: z.string().optional(),
    email: z.string().email().optional(),
    fullName: z.string().optional(),
    role: z.enum(["user", "admin", "moderator"]).optional(),
    isActive: z.boolean().optional(),
    phoneNumber: z.string().nullable().optional(),
    location: z.string().nullable().optional()
  });
  
  const validatedData = updateSchema.parse(req.body);
  
  // Check if user exists
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  // If updating username, check if new username is available
  if (validatedData.username && validatedData.username !== user.username) {
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
  }
  
  // If updating email, check if new email is available
  if (validatedData.email && validatedData.email !== user.email) {
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }
  
  // Update user
  const updatedUser = await storage.updateUser(userId, {
    ...validatedData,
    lastActive: validatedData.isActive ? new Date() : null
  });
  
  if (!updatedUser) {
    return res.status(500).json({ message: "Failed to update user" });
  }
  
  // Remove sensitive information
  const { password, ...safeUser } = updatedUser;
  
  return res.status(200).json({
    message: "User updated successfully",
    user: safeUser
  });
}

// Block/unblock user
export async function toggleUserBlock(req: Request, res: Response) {
  const userId = parseInt(req.params.id);
  
  // Check if user exists
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  // Toggle user's active status
  const updatedUser = await storage.updateUser(userId, {
    isActive: !user.isActive,
    lastActive: !user.isActive ? new Date() : null
  });
  
  if (!updatedUser) {
    return res.status(500).json({ message: "Failed to update user status" });
  }
  
  return res.status(200).json({
    message: updatedUser.isActive ? "User unblocked successfully" : "User blocked successfully",
    user: {
      id: updatedUser.id,
      isActive: updatedUser.isActive,
      lastActive: updatedUser.lastActive
    }
  });
}

// Delete user
export async function deleteUser(req: Request, res: Response) {
  const userId = parseInt(req.params.id);
  
  // Check if user exists
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  // Delete user
  await storage.deleteUser(userId);
  
  return res.status(200).json({
    message: "User deleted successfully"
  });
}

// Get user activity
export async function getUserActivity(req: Request, res: Response) {
  const userId = parseInt(req.params.id);
  
  // Check if user exists
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  // Get user's recent activity
  const [transactions, messages, marketplaceItems] = await Promise.all([
    storage.getUserTransactions(userId),
    storage.getUserMessages(userId),
    storage.getUserMarketplaceItems(userId)
  ]);
  
  // Get chama memberships
  const chamaMembers = await storage.getChamaMembershipsByUserId(userId);
  const chamas = await Promise.all(
    chamaMembers.map(async (member: ChamaMember) => {
      const chama = await storage.getChama(member.chamaId);
      return chama ? {
        ...chama,
        role: member.role,
        joinedAt: member.joinedAt
      } : null;
    }).filter((chama): chama is NonNullable<typeof chama> => chama !== null)
  );
  
  return res.status(200).json({
    transactions: transactions.slice(0, 5), // Last 5 transactions
    messages: messages.slice(0, 5), // Last 5 messages
    marketplaceItems: marketplaceItems.slice(0, 5), // Last 5 marketplace items
    chamas: chamas.slice(0, 5) // Last 5 chama memberships
  });
} 