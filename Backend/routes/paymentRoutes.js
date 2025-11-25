// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res, next) => {
    try {
        const { amount, currency = 'eur', email } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Il valore non può essere negativo o nullo' });
        }
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email non valida' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            receipt_email: email,
            metadata: { email },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });

    } catch (err) {
        console.error('Errore creazione PaymentIntent:', err);
        res.status(500).json({ error: err.message });
    }
});

// Crea una sessione di Checkout Stripe (usata dal frontend per redirect)
router.post('/create-checkout-session', async (req, res, next) => {
    try {
        const { cartItems = [], customerData = {}, successUrl, cancelUrl } = req.body;

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            const err = new Error('cartItems is required and must be a non-empty array');
            err.status = 400;
            return next(err);
        }

        // Costruisci line_items per Stripe Checkout
        const line_items = cartItems.map(item => {
            const unitAmount = Math.round((item.price || 0) * 100); // assume price in euro
            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.title || item.name || 'Product',
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            customer_email: customerData.email,
            success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/`,
            cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop`,
        });

        // return both id and browser-redirectable url (recommended since Stripe.js redirectToCheckout is removed)
        res.json({ sessionId: session.id, sessionUrl: session.url });
    } catch (err) {
        next(err);
    }
});
module.exports = router;
