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

module.exports = router;
