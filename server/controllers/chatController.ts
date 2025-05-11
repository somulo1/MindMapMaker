import { Request, Response } from "express";
import { storage } from "../storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Get user messages
export async function getUserMessages(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const messages = await storage.getUserMessages(userId);
  
  // Enrich messages with sender/receiver info
  const enrichedMessages = await Promise.all(
    messages.map(async (message) => {
      const sender = await storage.getUser(message.senderId);
      let receiver = null;
      
      if (message.receiverId) {
        receiver = await storage.getUser(message.receiverId);
      } else if (message.chamaId) {
        const chama = await storage.getChama(message.chamaId);
        receiver = { id: chama?.id, name: chama?.name, type: 'chama' };
      }
      
      return {
        ...message,
        sender: sender ? {
          id: sender.id,
          username: sender.username,
          fullName: sender.fullName,
          profilePic: sender.profilePic
        } : null,
        receiver: receiver ? {
          id: receiver.id,
          name: receiver.type === 'chama' ? receiver.name : receiver.fullName,
          type: receiver.type || 'user',
          profilePic: receiver.type !== 'chama' ? receiver.profilePic : null
        } : null
      };
    })
  );
  
  return res.status(200).json({ messages: enrichedMessages });
}

// Get chama messages
export async function getChamaMessages(req: Request, res: Response) {
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
  
  const messages = await storage.getChamaMessages(chamaId);
  
  // Enrich messages with sender info
  const enrichedMessages = await Promise.all(
    messages.map(async (message) => {
      const sender = await storage.getUser(message.senderId);
      
      return {
        ...message,
        sender: sender ? {
          id: sender.id,
          username: sender.username,
          fullName: sender.fullName,
          profilePic: sender.profilePic
        } : null
      };
    })
  );
  
  return res.status(200).json({ messages: enrichedMessages });
}

// Create a new message
export async function createMessage(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const messageSchema = z.object({
    content: z.string().min(1),
    receiverId: z.number().optional(),
    chamaId: z.number().optional(),
    itemId: z.number().optional()
  }).refine(data => data.receiverId !== undefined || data.chamaId !== undefined, {
    message: "Either receiverId or chamaId must be provided",
    path: ["receiverId"]
  });
  
  const validatedData = messageSchema.parse(req.body);
  
  // If it's a chama message, verify user is a member
  if (validatedData.chamaId) {
    const membership = await storage.getChamaMember(validatedData.chamaId, userId);
    if (!membership) {
      return res.status(403).json({ message: "You are not a member of this chama" });
    }
  }

  // If it's a marketplace message, verify the item exists
  if (validatedData.itemId) {
    const item = await storage.getMarketplaceItem(validatedData.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
  }
  
  const newMessage = await storage.createMessage({
    ...validatedData,
    senderId: userId
  });
  
  return res.status(201).json({
    message: "Message sent successfully",
    data: newMessage
  });
}
