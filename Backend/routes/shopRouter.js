// Backend/routes/shopRouter.js  ← VERSIONE 100% FUNZIONANTE ORA
const express = require('express');
const router = express.Router();
const db = require('../config/connection.js');

// CREATE - Nuovo ordine completo (con prodotti)
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name, customer_lastname, customer_address, customer_email,
      shipping_price = 9.99,
      status = 'pending',
      products = [] // <-- aggiunta protezione
    } = req.body;

    if (!products.length) throw new Error('Nessun prodotto nell\'ordine');

    const [orderResult] = await connection.execute(
      `INSERT INTO \`order\` 
       (customer_name, customer_lastname, customer_address, customer_email, shipping_price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_lastname, customer_address, customer_email, shipping_price, status]
    );

    const orderId = orderResult.insertId;

    for (const item of products) {
      const { product_id, quantity = 1 } = item;

      const [[product]] = await connection.execute(
        'SELECT name, price, discount FROM products WHERE id = ?',
        [product_id]
      );

      if (!product) throw new Error(`Prodotto con ID ${product_id} non trovato`);

      const priceAfterDiscount = product.price * (1 - (product.discount || 0) / 100);
      const finalCost = priceAfterDiscount * quantity;

      await connection.execute(
        `INSERT INTO product_order 
         (order_id, product_id, product_name, price_product, discount_product, quantity, final_cost)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          product_id,
          product.name,
          product.price,
          product.discount || 0,
          quantity,
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
      FROM \`order\` o
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
    const [orderRows] = await db.execute('SELECT * FROM `order` WHERE id = ?', [id]);
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
    const [result] = await db.execute('UPDATE `order` SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ordine non trovato' });
    res.json({ message: 'Stato aggiornato!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;