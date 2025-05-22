import { Request, Response } from "express";
import { storage } from "../storage";
import { insertMarketplaceItemSchema } from "@shared/schema";

// Get all marketplace items
export async function getMarketplaceItems(req: Request, res: Response) {
  const userId = (req.user as any)?.id;
  const items = await storage.getMarketplaceItems();
  
  // Get seller info and wishlist status for each item
  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      const seller = await storage.getUser(item.sellerId);
      const isInWishlist = userId ? await storage.getWishlistItem(userId, item.id) !== undefined : false;
      
      return {
        ...item,
        isInWishlist,
        seller: seller ? {
          id: seller.id,
          username: seller.username,
          fullName: seller.fullName,
          profilePic: seller.profilePic
        } : null
      };
    })
  );
  
  return res.status(200).json({ items: itemsWithDetails });
}

// Get marketplace item by ID
export async function getMarketplaceItemById(req: Request, res: Response) {
  const itemId = parseInt(req.params.id);
  const userId = (req.user as any)?.id;
  
  const item = await storage.getMarketplaceItem(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  
  // Get seller info and wishlist status
  const seller = await storage.getUser(item.sellerId);
  const isInWishlist = userId ? await storage.getWishlistItem(userId, item.id) !== undefined : false;
  
  const itemWithDetails = {
    ...item,
    isInWishlist,
    seller: seller ? {
      id: seller.id,
      username: seller.username,
      fullName: seller.fullName,
      profilePic: seller.profilePic
    } : null
  };
  
  return res.status(200).json({ item: itemWithDetails });
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

// Delete marketplace item
export async function deleteMarketplaceItem(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.id);

  // Check if item exists and belongs to the seller
  const item = await storage.getMarketplaceItem(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Verify ownership
  if (item.sellerId !== userId) {
    return res.status(403).json({ message: "You can only delete your own items" });
  }

  // Delete the item
  await storage.deleteMarketplaceItem(itemId);
  
  return res.status(200).json({ message: "Item deleted successfully" });
}

// Update marketplace item
export async function updateMarketplaceItem(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.id);

  // Check if item exists and belongs to the seller
  const item = await storage.getMarketplaceItem(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Verify ownership
  if (item.sellerId !== userId) {
    return res.status(403).json({ message: "You can only update your own items" });
  }

  // Validate update data
  const validatedData = insertMarketplaceItemSchema.partial().parse({
    ...req.body,
    sellerId: userId
  });

  // If updating chama association, verify membership
  if (validatedData.chamaId) {
    const membership = await storage.getChamaMember(validatedData.chamaId, userId);
    if (!membership) {
      return res.status(403).json({ message: "You are not a member of this chama" });
    }
  }

  // Update the item
  const updatedItem = await storage.updateMarketplaceItem(itemId, validatedData);
  
  return res.status(200).json({
    message: "Item updated successfully",
    item: updatedItem
  });
}
