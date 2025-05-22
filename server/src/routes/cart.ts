import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { storage } from '../storage';
import { addToCart, removeFromCart, updateCartItem, getUserCart, checkoutCart } from '../controllers/cartController';

const router = Router();

// Cart routes
router.get('/', authenticateToken, getUserCart);
router.post('/', authenticateToken, addToCart);
router.put('/', authenticateToken, updateCartItem);
router.delete('/:itemId', authenticateToken, removeFromCart);
router.post('/checkout', authenticateToken, checkoutCart);

export default router; 