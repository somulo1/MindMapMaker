import { Request, Response } from "express";
import { storage } from "../storage";

// Add item to cart
export async function addToCart(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const { itemId, quantity } = req.body;

  // Validate input
  if (!itemId || !quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // Check if item exists and has enough quantity
  const item = await storage.getMarketplaceItem(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (item.quantity < quantity) {
    return res.status(400).json({ message: "Not enough items in stock" });
  }

  // Check if item is already in cart
  const existingCartItem = await storage.getCartItem(userId, itemId);
  if (existingCartItem) {
    // Update quantity if item exists
    const newQuantity = existingCartItem.quantity + quantity;
    if (item.quantity < newQuantity) {
      return res.status(400).json({ message: "Not enough items in stock" });
    }
    const updatedCartItem = await storage.updateCartItem(userId, itemId, { quantity: newQuantity });
    return res.status(200).json({ message: "Cart updated", item: updatedCartItem });
  }

  // Add to cart
  const cartItem = await storage.addToCart(userId, itemId, quantity);
  return res.status(201).json({ message: "Item added to cart", item: cartItem });
}

// Remove item from cart
export async function removeFromCart(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.itemId);

  // Check if item exists in cart
  const cartItem = await storage.getCartItem(userId, itemId);
  if (!cartItem) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  // Remove from cart
  await storage.removeFromCart(userId, itemId);
  return res.status(200).json({ message: "Item removed from cart" });
}

// Update cart item quantity
export async function updateCartItem(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.itemId);
  const { quantity } = req.body;

  // Validate input
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  // Check if item exists in cart
  const cartItem = await storage.getCartItem(userId, itemId);
  if (!cartItem) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  // Check if enough items in stock
  const item = await storage.getMarketplaceItem(itemId);
  if (!item || item.quantity < quantity) {
    return res.status(400).json({ message: "Not enough items in stock" });
  }

  // Update cart item
  const updatedCartItem = await storage.updateCartItem(userId, itemId, { quantity });
  return res.status(200).json({ message: "Cart updated", item: updatedCartItem });
}

// Get user's cart
export async function getUserCart(req: Request, res: Response) {
  const userId = (req.user as any).id;

  const cartItems = await storage.getUserCart(userId);
  
  // Get full item details for each cart item
  const itemsWithDetails = await Promise.all(
    cartItems.map(async (cartItem) => {
      const item = await storage.getMarketplaceItem(cartItem.itemId);
      const seller = item ? await storage.getUser(item.sellerId) : null;
      
      return {
        ...item,
        quantity: cartItem.quantity,
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

// Checkout cart
export async function checkoutCart(req: Request, res: Response) {
  const userId = (req.user as any).id;

  // Get user's cart
  const cartItems = await storage.getUserCart(userId);
  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Get user's wallet
  const wallet = await storage.getUserWallet(userId);
  if (!wallet) {
    return res.status(400).json({ message: "Wallet not found" });
  }

  // Calculate total amount
  let totalAmount = 0;
  const orderItems = [];

  for (const cartItem of cartItems) {
    const item = await storage.getMarketplaceItem(cartItem.itemId);
    if (!item) {
      return res.status(400).json({ message: `Item ${cartItem.itemId} not found` });
    }

    if (item.quantity < cartItem.quantity) {
      return res.status(400).json({ message: `Not enough items in stock for ${item.title}` });
    }

    const itemTotal = item.price * cartItem.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      itemId: item.id,
      quantity: cartItem.quantity,
      price: item.price
    });
  }

  // Check if user has enough balance
  if (wallet.balance < totalAmount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  // Create order
  const order = await storage.createOrder(userId, totalAmount, orderItems);

  // Update item quantities
  for (const cartItem of cartItems) {
    const item = await storage.getMarketplaceItem(cartItem.itemId);
    if (item) {
      await storage.updateMarketplaceItem(item.id, {
        quantity: item.quantity - cartItem.quantity
      });
    }
  }

  // Update wallet balance
  await storage.updateWalletBalance(userId, wallet.balance - totalAmount);

  // Clear cart
  await storage.clearUserCart(userId);

  return res.status(200).json({
    message: "Order placed successfully",
    order
  });
} 