const express = require('express');
const router = express.Router();
const cartControllers = require('../controllers/cartControllers');

// Gestione carrello
router.get('/:sessionId', cartControllers.getCart);
router.post('/:sessionId/items', cartControllers.addToCart);
router.post('/:sessionId/items/:productId/increase', cartControllers.increaseQuantity);
router.post('/:sessionId/items/:productId/decrease', cartControllers.decreaseQuantity);
router.put('/:sessionId/items/:productId', cartControllers.updateCartItem);
router.delete('/:sessionId/items/:productId', cartControllers.removeFromCart);
router.delete('/:sessionId', cartControllers.clearCart);

module.exports = router;
