import { Request, Response } from "express";
import { storage } from "../storage";
import { insertMarketplaceItemSchema } from "@shared/schema";

// Get all marketplace items
export async function getMarketplaceItems(req: Request, res: Response) {
  const items = await storage.getMarketplaceItems();
  
  // Get seller info for each item
  const itemsWithSellerInfo = await Promise.all(
    items.map(async (item) => {
      const seller = await storage.getUser(item.sellerId);
      return {
        ...item,
        seller: seller ? {
          id: seller.id,
          username: seller.username,
          fullName: seller.fullName,
          profilePic: seller.profilePic
        } : null
      };
    })
  );
  
  return res.status(200).json({ items: itemsWithSellerInfo });
}

// Get marketplace item by ID
export async function getMarketplaceItemById(req: Request, res: Response) {
  const itemId = parseInt(req.params.id);
  
  const item = await storage.getMarketplaceItem(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  
  // Get seller info
  const seller = await storage.getUser(item.sellerId);
  const itemWithSellerInfo = {
    ...item,
    seller: seller ? {
      id: seller.id,
      username: seller.username,
      fullName: seller.fullName,
      profilePic: seller.profilePic
    } : null
  };
  
  return res.status(200).json({ item: itemWithSellerInfo });
}

// Get user's marketplace items
export async function getUserMarketplaceItems(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const items = await storage.getUserMarketplaceItems(userId);
  
  return res.status(200).json({ items });
}

// Create marketplace item
export async function createMarketplaceItem(req: Request, res: Response) {
  const userId = (req.user as any).id;
  
  const validatedData = insertMarketplaceItemSchema.parse({
    ...req.body,
    sellerId: userId
  });
  
  // If the item is associated with a chama, verify user is a member
  if (validatedData.chamaId) {
    const membership = await storage.getChamaMember(validatedData.chamaId, userId);
    if (!membership) {
      return res.status(403).json({ message: "You are not a member of this chama" });
    }
  }
  
  const newItem = await storage.createMarketplaceItem(validatedData);
  
  return res.status(201).json({
    message: "Item created successfully",
    item: newItem
  });
}
