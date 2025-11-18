// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res, next) => {
    try {
        const { amount, currency = 'eur' } = req.body;

        if (!amount) {
            const err = new Error("Amount is required");
            err.status = 400;
            return next(err);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
