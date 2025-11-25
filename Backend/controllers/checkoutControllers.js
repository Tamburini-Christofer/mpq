const db = require('../config/connection');
const { sendOrderConfirmation } = require('../services/emailService');

// CREATE ORDER
exports.createOrder = async (req, res, next) => {
    try {
        const {
            customerName,
            customerLastname,
            customerEmail,
            customerAddress,
            shippingPrice,
            items,
            totalPrice,
            disability = false
        } = req.body;

        // Validazione
        if (!customerName || !customerLastname || !customerEmail || !customerAddress || !items || !totalPrice) {
            const err = new Error("Dati obbligatori mancanti");
            err.status = 400;
            return next(err);
        }

        if (!Array.isArray(items) || items.length === 0) {
            const err = new Error("Il carrello è vuoto");
            err.status = 400;
            return next(err);
        }

        // Crea l'ordine
        const [result] = await db.query(`
            INSERT INTO orders 
            (customer_name, customer_lastname, customer_email, customer_address, shipping_price, orders_total_price, disability, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
            customerName,
            customerLastname,
            customerEmail,
            customerAddress,
            shippingPrice || 0,
            totalPrice,
            disability ? 1 : 0
        ]);

        const orderId = result.insertId;
        const orderNumber = `MPQ-${orderId.toString().padStart(6, '0')}`;

        // Inserisci gli item dell'ordine
        for (const item of items) {
            const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            const discount = item.discount || 0;
            const finalPrice = discount > 0 ? discount : price;
            
            await db.query(`
                INSERT INTO order_items 
                (order_id, product_id, quantity, price, discount)
                VALUES (?, ?, ?, ?, ?)
            `, [orderId, item.id, item.quantity, price, discount]);
        }

        // Invia email di conferma (non bloccante)
        sendOrderConfirmation(
            customerEmail,
            customerName,
            orderNumber,
            '#' // Link PDF - da implementare con il vero link
        ).catch(err => {
            console.error('⚠️ Errore invio email (ordine creato comunque):', err);
        });

        res.status(201).json({
            message: "Ordine creato con successo",
            orderId: orderId,
            orderNumber: orderNumber
        });

    } catch (err) {
        next(err);
    }
};

// GET ORDER
exports.getOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const [orders] = await db.query(`
            SELECT * FROM orders WHERE id = ?
        `, [orderId]);

        if (orders.length === 0) {
            const err = new Error("Ordine non trovato");
            err.status = 404;
            return next(err);
        }

        const [items] = await db.query(`
            SELECT oi.*, p.name, p.image, p.slug
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);

        const order = orders[0];
        order.items = items;
        order.disability = Boolean(order.disability);

        res.json(order);

    } catch (err) {
        next(err);
    }
};

// GET USER ORDERS
exports.getUserOrders = async (req, res, next) => {
    try {
        const { email } = req.params;

        const [orders] = await db.query(`
            SELECT o.*, 
                   COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_email = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [email]);

        res.json(orders);

    } catch (err) {
        next(err);
    }
};
