const express = require('express');
const router = express.Router();
const checkoutControllers = require('../controllers/checkoutControllers');

// Checkout
router.post('/create-order', checkoutControllers.createOrder);
router.get('/orders/:orderId', checkoutControllers.getOrder);
router.get('/user/:email/orders', checkoutControllers.getUserOrders);

module.exports = router;
