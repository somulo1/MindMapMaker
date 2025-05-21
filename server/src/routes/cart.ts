import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

// Checkout cart items and process wallet transfers
router.post('/checkout', authenticateToken, async (req, res) => {
  const { cartItems, totalAmount } = req.body;
  const buyerId = req.user.id;

  try {
    // Validate input
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid cart items' 
      });
    }

    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid total amount' 
      });
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Get buyer's wallet and verify balance
      const buyerWallet = await prisma.wallet.findUnique({
        where: { userId: buyerId }
      });

      if (!buyerWallet) {
        throw new BadRequestError('Buyer wallet not found');
      }

      if (buyerWallet.balance < totalAmount) {
        throw new BadRequestError('Insufficient balance');
      }

      // 2. Process each cart item
      const transactions = [];
      const orderItems = [];

      for (const item of cartItems) {
        try {
          // Get marketplace item and verify it exists
          const marketplaceItem = await prisma.marketplaceItem.findUnique({
            where: { id: item.itemId }
          });

          if (!marketplaceItem) {
            throw new BadRequestError(`Item ${item.itemId} not found`);
          }

          if (marketplaceItem.quantity < item.quantity) {
            throw new BadRequestError(`Insufficient quantity available for ${marketplaceItem.title}`);
          }

          // Get seller's wallet
          const sellerWallet = await prisma.wallet.findUnique({
            where: { userId: item.sellerId }
          });

          if (!sellerWallet) {
            throw new BadRequestError(`Seller wallet not found for item ${item.itemId}`);
          }

          // Calculate item total
          const itemTotal = item.quantity * marketplaceItem.price;

          // Update buyer's wallet (deduct amount)
          await prisma.wallet.update({
            where: { id: buyerWallet.id },
            data: { balance: { decrement: itemTotal } }
          });

          // Update seller's wallet (add amount)
          await prisma.wallet.update({
            where: { id: sellerWallet.id },
            data: { balance: { increment: itemTotal } }
          });

          // Create transaction record
          const transaction = await prisma.transaction.create({
            data: {
              amount: itemTotal,
              type: 'MARKETPLACE',
              status: 'COMPLETED',
              fromUserId: buyerId,
              toUserId: item.sellerId,
              description: `Purchase of ${marketplaceItem.title}`,
            }
          });

          transactions.push(transaction);

          // Create order item and mark as purchased
          const orderItem = await prisma.orderItem.create({
            data: {
              quantity: item.quantity,
              price: itemTotal / item.quantity,
              marketplaceItemId: item.itemId,
              buyerId: buyerId,
              sellerId: item.sellerId,
              status: 'COMPLETED',
              transactionId: transaction.id
            }
          });

          orderItems.push(orderItem);

          // Update marketplace item quantity and status
          await prisma.marketplaceItem.update({
            where: { id: item.itemId },
            data: {
              quantity: { decrement: item.quantity },
              status: marketplaceItem.quantity === item.quantity ? 'SOLD' : 'ACTIVE'
            }
          });
        } catch (itemError) {
          console.error('Error processing item:', item.itemId, itemError);
          throw itemError; // Re-throw to trigger transaction rollback
        }
      }

      // 3. Clear the cart
      await prisma.cartItem.deleteMany({
        where: { userId: buyerId }
      });

      return {
        success: true,
        message: 'Checkout completed successfully',
        transactions,
        orderItems
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    // Log the full error for debugging
    console.error('Detailed checkout error:', {
      error: error.message,
      stack: error.stack,
      userId: buyerId,
      cartItems,
      totalAmount
    });

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during checkout. Please try again.' 
    });
  }
});

// Get cart items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        marketplaceItem: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePic: true
              }
            }
          }
        }
      }
    });

    const formattedItems = cartItems.map(item => ({
      id: item.id,
      itemId: item.marketplaceItemId,
      quantity: item.quantity,
      title: item.marketplaceItem.title,
      price: item.marketplaceItem.price,
      currency: item.marketplaceItem.currency || 'KES',
      imageUrl: item.marketplaceItem.imageUrl,
      seller: item.marketplaceItem.seller
    }));

    const total = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      items: formattedItems,
      total
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
});

// Add item to cart
router.post('/', authenticateToken, async (req, res) => {
  const { itemId, quantity = 1 } = req.body;

  try {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        marketplaceItemId: itemId
      }
    });

    if (existingItem) {
      // Update quantity if item already exists
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Add new item to cart
      await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          marketplaceItemId: itemId,
          quantity
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/', authenticateToken, async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    await prisma.cartItem.updateMany({
      where: {
        userId: req.user.id,
        marketplaceItemId: itemId
      },
      data: { quantity }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/:itemId', authenticateToken, async (req, res) => {
  const itemId = parseInt(req.params.itemId);

  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    const result = await prisma.cartItem.deleteMany({
      where: {
        userId: req.user.id,
        id: itemId
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

export default router; 