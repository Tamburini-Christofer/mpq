// routes/StripeWebhook.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendPaymentConfirmationEmail } = require('../services/emailService'); // <-- AGGIUNTO

router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log('Webhook firma non valida:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const email = paymentIntent.receipt_email || paymentIntent.metadata.email;

      if (email) {
        const amount = (paymentIntent.amount_received / 100).toFixed(2);
        const currency = paymentIntent.currency.toUpperCase();

        try {
          await sendPaymentConfirmationEmail({                     
            to: email,
            amount,
            currency,
            paymentIntentId: paymentIntent.id,
            date: new Date().toLocaleDateString('it-IT'),
          });
          console.log(`Email inviata a ${email}`);
        } catch (emailErr) {
          console.error('Errore invio email:', emailErr);
        }
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;