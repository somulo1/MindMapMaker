import { Request, Response } from "express";
import { storage } from "../storage";

// Add item to wishlist
export async function addToWishlist(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.itemId);

  // Check if item exists
  const item = await storage.getMarketplaceItem(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Check if item is already in wishlist
  const existingWishlistItem = await storage.getWishlistItem(userId, itemId);
  if (existingWishlistItem) {
    return res.status(400).json({ message: "Item already in wishlist" });
  }

  // Add to wishlist
  const wishlistItem = await storage.addToWishlist(userId, itemId);
  return res.status(201).json({ message: "Item added to wishlist", item: wishlistItem });
}

// Remove item from wishlist
export async function removeFromWishlist(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.itemId);

  // Check if item exists in wishlist
  const wishlistItem = await storage.getWishlistItem(userId, itemId);
  if (!wishlistItem) {
    return res.status(404).json({ message: "Item not found in wishlist" });
  }

  // Remove from wishlist
  await storage.removeFromWishlist(userId, itemId);
  return res.status(200).json({ message: "Item removed from wishlist" });
}

// Get user's wishlist
export async function getUserWishlist(req: Request, res: Response) {
  const userId = (req.user as any).id;

  const wishlistItems = await storage.getUserWishlist(userId);
  
  // Get full item details for each wishlist item
  const itemsWithDetails = await Promise.all(
    wishlistItems.map(async (wishlistItem) => {
      const item = await storage.getMarketplaceItem(wishlistItem.itemId);
      const seller = item ? await storage.getUser(item.sellerId) : null;
      
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

  return res.status(200).json({ items: itemsWithDetails });
} 