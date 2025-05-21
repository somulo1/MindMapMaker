import { Request, Response } from "express";
import { storage } from "../storage";
import { insertChamaSchema, insertChamaMemberSchema } from "@shared/schema";
import { z } from "zod";

// Get user's chamas
export async function getUserChamas(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const chamas = await storage.getChamasByUserId(userId);
  
  return res.status(200).json({ chamas });
}

// Create a new chama
export async function createChama(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const validatedData = insertChamaSchema.parse({
    ...req.body,
    createdBy: userId
  });
  
  // Create the chama
  const newChama = await storage.createChama(validatedData);
  
  // Add creator as chairperson
  await storage.addChamaMember({
    chamaId: newChama.id,
    userId: userId,
    role: "chairperson",
    isActive: true
  });
  
  // Create chat group by creating initial system message
  await storage.createMessage({
    senderId: userId,
    chamaId: newChama.id,
    content: `Welcome to ${newChama.name}! 🎉\n\nThis is your chama's group chat. All members can communicate here about chama activities, meetings, and contributions.\n\nGroup Name: ${newChama.name}\nCreated by: ${(req.user as any).fullName}`,
    isSystemMessage: true
  });
  
  // Return the chama object in the expected structure
  return res.status(201).json({
    message: "Chama created successfully",
    chama: {
      ...newChama,
      icon: validatedData.icon || "groups",
      iconBg: validatedData.iconBg || "primary"
    }
  });
}

// Get chama by ID
export async function getChamaById(req: Request, res: Response) {
  const chamaId = parseInt(req.params.id);
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
  
  return res.status(200).json({ chama });
}

// Add member to chama
export async function addChamaMember(req: Request, res: Response) {
  const chamaId = parseInt(req.params.id);
  const userId = (req.user as any).id;
  
  // Verify chama exists
  const chama = await storage.getChama(chamaId);
  if (!chama) {
    return res.status(404).json({ message: "Chama not found" });
  }
  
  // Verify user is authorized to add members (must be chairperson or treasurer)
  const membership = await storage.getChamaMember(chamaId, userId);
  if (!membership || (membership.role !== "chairperson" && membership.role !== "treasurer")) {
    return res.status(403).json({ message: "Not authorized to add members" });
  }
  
  const validatedData = z.object({
    userId: z.number(),
    role: z.string().optional(),
    contributionAmount: z.number().optional(),
    contributionFrequency: z.string().optional()
  }).parse(req.body);
  
  // Check if user is already a member
  const existingMembership = await storage.getChamaMember(chamaId, validatedData.userId);
  if (existingMembership) {
    return res.status(400).json({ message: "User is already a member of this chama" });
  }
  
  // Add member
  const newMember = await storage.addChamaMember({
    chamaId,
    userId: validatedData.userId,
    role: validatedData.role || "member",
    contributionAmount: validatedData.contributionAmount,
    contributionFrequency: validatedData.contributionFrequency,
    isActive: true
  });
  
  return res.status(201).json({
    message: "Member added successfully",
    member: newMember
  });
}

// Get chama members
export async function getChamaMembers(req: Request, res: Response) {
  const chamaId = parseInt(req.params.id);
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
  
  const members = await storage.getChamaMembers(chamaId);
  
  // Get full user details for each member
  const membersWithUserDetails = await Promise.all(
    members.map(async (member) => {
      const user = await storage.getUser(member.userId);
      return {
        ...member,
        user: user ? {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
          location: user.location
        } : null
      };
    })
  );
  
  return res.status(200).json({ members: membersWithUserDetails });
}
