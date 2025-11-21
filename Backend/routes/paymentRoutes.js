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

router.post('/create-checkout-session', async (req, res, next) => {
    try {
        const { cartItems, customerData, successUrl, cancelUrl } = req.body;

        if (!cartItems || !cartItems.length) {
            const err = new Error("Cart items are required");
            err.status = 400;
            return next(err);
        }

        if (!customerData || !customerData.email) {
            const err = new Error("Customer data with email is required");
            err.status = 400;
            return next(err);
        }

        // Calcola il totale dal carrello
        const totalAmount = cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Crea i line items per Stripe
        const lineItems = cartItems.map(item => {
            const productData = {
                name: item.name || `Prodotto ID: ${item.id}`,
            };
            
            // Aggiungi description solo se non è vuota
            if (item.description && item.description.trim()) {
                productData.description = item.description;
            }
            
            // Aggiungi immagini solo se esistono
            if (item.image_url && item.image_url.trim()) {
                productData.images = [item.image_url];
            }
            
            return {
                price_data: {
                    currency: 'eur',
                    product_data: productData,
                    unit_amount: Math.round(item.price * 100), // Stripe usa centesimi
                },
                quantity: item.quantity
            };
        });

        console.log('📦 Creazione sessione Stripe per:', customerData.email);
        console.log('Prodotti nel carrello:', cartItems.length);
        console.log('Totale ordine: €', totalAmount.toFixed(2));

        // Aggiungi spedizione se necessario (es. se sotto 40€)
        const freeShippingThreshold = 40;
        if (totalAmount < freeShippingThreshold) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Spedizione',
                        description: 'Costo di spedizione'
                    },
                    unit_amount: 499, // 4.99€ in centesimi
                },
                quantity: 1
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerData?.email,
            shipping_address_collection: {
                allowed_countries: ['IT', 'US', 'CA', 'GB', 'FR', 'DE', 'ES']
            },
            metadata: {
                customer_name: `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim(),
                customer_email: customerData?.email || '',
                customer_phone: customerData?.phone || '',
                shipping_address: customerData?.shippingAddress || '',
                shipping_city: customerData?.shippingCity || '',
                shipping_postal_code: customerData?.shippingPostalCode || '',
                shipping_country: customerData?.shippingCountry || '',
                notes: customerData?.notes || ''
            }
        });

        console.log('✅ Sessione Stripe creata con successo:', session.id);
        console.log('🔗 URL checkout:', session.url);
        res.json({ 
            sessionId: session.id,
            url: session.url 
        });
    } catch (err) {
        console.error('Errore nella creazione della sessione checkout:', err);
        next(err);
    }
});

module.exports = router;
