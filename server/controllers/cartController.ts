import { Request, Response } from "express";
import { storage } from "../storage";

// Add item to cart
export async function addToCart(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const { itemId, quantity = 1 } = req.body;

  try {
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
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: "Failed to add item to cart" });
  }
}

// Remove item from cart
export async function removeFromCart(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const itemId = parseInt(req.params.itemId);

  try {
    // Check if item exists in cart
    const cartItem = await storage.getCartItem(userId, itemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove from cart
    await storage.removeFromCart(userId, itemId);
    return res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ message: "Failed to remove item from cart" });
  }
}

// Update cart item quantity
export async function updateCartItem(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const { itemId, quantity } = req.body;

  try {
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
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
}

// Get user's cart
export async function getUserCart(req: Request, res: Response) {
  const userId = (req.user as any).id;

  try {
    const cartItems = await storage.getUserCart(userId);
    
    // Get full item details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (cartItem) => {
        const item = await storage.getMarketplaceItem(cartItem.itemId);
        const seller = item ? await storage.getUser(item.sellerId) : null;
        
        return {
          id: cartItem.id,
          itemId: cartItem.itemId,
          quantity: cartItem.quantity,
          title: item?.title || '',
          price: item?.price || 0,
          currency: item?.currency || 'KES',
          imageUrl: item?.imageUrl,
          seller: seller ? {
            id: seller.id,
            username: seller.username,
            fullName: seller.fullName,
            profilePic: seller.profilePic
          } : null
        };
      })
    );

    const total = itemsWithDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return res.status(200).json({ 
      items: itemsWithDetails,
      total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: "Failed to fetch cart items" });
  }
}

// Checkout cart
export async function checkoutCart(req: Request, res: Response) {
  const userId = (req.user as any).id;

  try {
    // Get user's cart
    const cartItems = await storage.getUserCart(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart is empty" 
      });
    }

    // Get user's wallet
    const wallet = await storage.getUserWallet(userId);
    if (!wallet) {
      return res.status(400).json({ 
        success: false, 
        message: "Wallet not found" 
      });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];
    const itemsToUpdate = new Map();

    for (const cartItem of cartItems) {
      const item = await storage.getMarketplaceItem(cartItem.itemId);
      if (!item) {
        return res.status(400).json({ 
          success: false, 
          message: `Item ${cartItem.itemId} not found` 
        });
      }

      if (!item.isActive) {
        return res.status(400).json({
          success: false,
          message: `Item ${item.title} is no longer available`
        });
      }

      if (item.quantity < cartItem.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough items in stock for ${item.title}` 
        });
      }

      const itemTotal = item.price * cartItem.quantity;
      totalAmount += itemTotal;

      // Get seller's wallet
      const seller = await storage.getUser(item.sellerId);
      if (!seller) {
        return res.status(400).json({ 
          success: false, 
          message: `Seller not found for item ${item.title}` 
        });
      }

      const sellerWallet = await storage.getUserWallet(seller.id);
      if (!sellerWallet) {
        return res.status(400).json({ 
          success: false, 
          message: `Seller wallet not found for item ${item.title}` 
        });
      }

      orderItems.push({
        itemId: item.id,
        quantity: cartItem.quantity,
        price: item.price,
        sellerId: seller.id,
        sellerWalletId: sellerWallet.id
      });

      itemsToUpdate.set(item.id, {
        currentQuantity: item.quantity,
        orderQuantity: cartItem.quantity
      });
    }

    // Check if user has enough balance
    if (wallet.balance < totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient balance" 
      });
    }

    // Verify quantities again and lock items
    for (const [itemId, quantities] of itemsToUpdate) {
      const item = await storage.getMarketplaceItem(itemId);
      if (!item || !item.isActive || item.quantity < quantities.orderQuantity) {
        return res.status(400).json({
          success: false,
          message: `Item ${item?.title || itemId} is no longer available in the requested quantity`
        });
      }
    }

    // Create order first
    const order = await storage.createOrder(userId, totalAmount, orderItems);

    // Process each order item
    for (const orderItem of orderItems) {
      // Create transaction record for payment
      await storage.createTransaction({
        userId,
        type: 'transfer',
        amount: orderItem.price * orderItem.quantity,
        description: `Payment for order #${order.id}`,
        sourceWallet: wallet.id,
        destinationWallet: orderItem.sellerWalletId,
        status: 'pending'
      });

      // Create transaction record for seller
      await storage.createTransaction({
        userId: orderItem.sellerId,
        type: 'transfer',
        amount: orderItem.price * orderItem.quantity,
        description: `Sale payment for order #${order.id}`,
        sourceWallet: null,
        destinationWallet: orderItem.sellerWalletId,
        status: 'completed'
      });
    }

    // Update buyer's wallet
    await storage.updateWallet(wallet.id, {
      balance: wallet.balance - totalAmount
    });

    // Update sellers' wallets
    for (const orderItem of orderItems) {
      const sellerWallet = await storage.getUserWallet(orderItem.sellerId);
      if (sellerWallet) {
        await storage.updateWallet(sellerWallet.id, {
          balance: sellerWallet.balance + (orderItem.price * orderItem.quantity)
        });
      }
    }

    // Clear cart
    await storage.clearUserCart(userId);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during checkout. Please try again.' 
    });
  }
} 