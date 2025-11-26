// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const {
      cartItems = [],
      customerData = {},
      success_url,
      cancel_url
    } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Carrello vuoto' });
    }

    // Line items per Stripe Checkout
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title || item.name || 'Prodotto',
        },
        unit_amount: Math.round(parseFloat(item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const totalAmount = line_items.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity);
    }, 0) / 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: customerData.email,
      success_url: success_url || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop`,
      payment_intent_data: {
        metadata: {
          customer_email: customerData.email,
          customer_name: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
          total_amount: totalAmount.toFixed(2),
          shipping_address: `${customerData.shippingAddress || ''}, ${customerData.shippingPostalCode || ''} ${customerData.shippingCity || ''}`,
          products: JSON.stringify(cartItems.map(item => ({
            name: item.name || item.title,
            qty: item.quantity,
            price: item.price
          })))
        }
      }
    });

    res.json({ sessionUrl: session.url });

  } catch (err) {
    console.error('Errore creazione Checkout Session:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
