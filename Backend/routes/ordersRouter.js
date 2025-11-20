
const express = require('express');
const router = express.Router();
const db = require('../config/connection.js');

// CREATE - Nuovo ordine completo (con prodotti)
router.post('/', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name, customer_lastname, customer_address, customer_email,
      shipping_price,
      status = 'pending',
      products = []
    } = req.body;

    if (!customer_name || typeof customer_name !== "string") {
      const err = new Error('Manca il nome, o il nome non è una stringa')
      err.status = 400
      return next(err)
    }

    if (!customer_lastname || typeof customer_lastname !== "string") {
      const err = new Error('Manca il cognnome, o il cognome non è una stringa')
      err.status = 400
      return next(err)
    }

    if (!customer_email || typeof customer_email !== "string") {
      const err = new Error('Manca l\'email, o l\'email non è una stringa')
      err.status = 400
      return next(err)
    }

    if (!customer_address || typeof customer_address !== "string") {
      const err = new Error('Manca l\'indirizzo, o l\'indirizzo non è una stringa')
      err.status = 400
      return next(err)
    }

    if (!status || typeof status !== "string") {
      const err = new Error('Manca lo stato, o lo stato non è una stringa')
      err.status = 400
      return next(err)
    }

    if (!products.length) throw new Error('Nessun prodotto nell\'ordine');

    const shippingPrice = shipping_price !== undefined ? shipping_price : 4.99;

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
       (customer_name, customer_lastname, customer_address, customer_email, shipping_price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_lastname, customer_address, customer_email, shippingPrice, status]
    );

    const orderId = orderResult.insertId;

    for (const item of products) {
      const { product_name, quantity = 1 } = item;

      const qty = Number(quantity);
      if (!qty || qty <= 0) {
        const err = new Error("Quantità prodotto deve essere maggiore di 0");
        err.status = 400;
        return next(err);
      }

      const [[product]] = await connection.execute(
        'SELECT name, price, discount FROM products WHERE name = ?',
        [product_name]
      );

      if (!product) {
        const err = new Error(`Prodotto con nome ${product_name} non trovato`);
        err.status = 404;
        return next(err);
      }

      const priceAfterDiscount = product.price * (1 - (product.discount || 0) / 100);
      const finalCost = priceAfterDiscount * qty;

      await connection.execute(
        `INSERT INTO product_order 
     (order_id, product_name, price_product, discount_product, quantity, final_cost)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          product.name,
          product.price,
          product.discount || 0,
          qty,
          finalCost
        ]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Ordine creato con successo!', order_id: orderId });

  } catch (err) {
    await connection.rollback();
    console.error('Errore creazione ordine:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});


// READ - Tutti gli ordini
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT 
        o.*,
        COUNT(po.id) AS items_count,
        COALESCE(SUM(po.final_cost), 0) + o.shipping_price AS total_amount
      FROM orders o
      LEFT JOIN product_order po ON o.id = po.order_id
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Dettaglio ordine
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [orderRows] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    const [items] = await db.execute('SELECT * FROM product_order WHERE order_id = ?', [id]);

    if (orderRows.length === 0) return res.status(404).json({ message: 'Ordine non trovato' });

    res.json({ order: orderRows[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Cambia stato
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const [result] = await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ordine non trovato' });
    res.json({ message: 'Stato aggiornato!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;