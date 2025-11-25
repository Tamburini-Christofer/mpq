// routes/StripeWebhook.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendPaymentConfirmationEmail } = require('../services/emailService'); // funzione già esistente

router.post(
  '/',
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
      const amount = (paymentIntent.amount_received / 100).toFixed(2);
      const currency = paymentIntent.currency.toUpperCase();
      const date = new Date().toLocaleDateString('it-IT');

      // Email al cliente
      const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.customer_email;

      if (customerEmail) {
        // Dichiariamo products prima di passarlo alla funzione
        const products = paymentIntent.metadata?.products
          ? JSON.parse(paymentIntent.metadata.products)
          : [];

        await sendPaymentConfirmationEmail({
          to: customerEmail,
          amount,
          currency,
          paymentIntentId: paymentIntent.id,
          date,
          products
        })
          .then(() => console.log(`Email inviata al cliente: ${customerEmail}`))
          .catch(err => console.error('Errore invio email al cliente:', err));
      } else {
        console.log('Nessuna email cliente disponibile.');
      }

      // Email interna all’azienda
      const internalEmail = process.env.COMPANY_EMAIL;
      await sendPaymentConfirmationEmail({
        to: internalEmail,
        amount,
        currency,
        paymentIntentId: paymentIntent.id,
        date,
        isInternal: true,               // flag per template email interna
        customerData: paymentIntent.metadata, // tutti i dati del cliente
        products: paymentIntent.metadata?.products
          ? JSON.parse(paymentIntent.metadata.products)
          : []
      })
        .then(() => console.log(`Email interna inviata a: ${internalEmail}`))
        .catch(err => console.error('Errore invio email interna:', err));
    }

    res.json({ received: true });
  }
);

module.exports = router;
