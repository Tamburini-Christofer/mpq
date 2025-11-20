
const express = require('express');
const router = express.Router();
const db = require('../config/connection.js');

// CREATE - Nuovo ordine completo (con prodotti e uso dello slug al posto dell'id) 
router.post('/', async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_lastname,
      customer_address,
      customer_email,
      shipping_price,
      status = 'pending',
      products = []
    } = req.body;


    if (!customer_name || typeof customer_name !== "string") {
      const err = new Error('Manca il nome, o il nome non è una stringa');
      err.status = 400;
      return next(err);
    }
    if (!customer_lastname || typeof customer_lastname !== "string") {
      const err = new Error('Manca il cognome, o il cognome non è una stringa');
      err.status = 400;
      return next(err);
    }
    if (!customer_email || typeof customer_email !== "string") {
      const err = new Error('Manca l\'email, o l\'email non è una stringa');
      err.status = 400;
      return next(err);
    }
    if (!customer_address || typeof customer_address !== "string") {
      const err = new Error('Manca l\'indirizzo, o l\'indirizzo non è una stringa');
      err.status = 400;
      return next(err);
    }

    if (!products.length) {
      const err = new Error('Nessun prodotto nell\'ordine');
      err.status = 400;
      return next(err);
    }

    const shippingPrice = shipping_price !== undefined ? shipping_price : 4.99;


    const [orderResult] = await connection.execute(
      `INSERT INTO orders
       (customer_name, customer_lastname, customer_address, customer_email, shipping_price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_lastname, customer_address, customer_email, shippingPrice, status]
    );

    const orderId = orderResult.insertId;
    let productsTotal = 0;

    for (const item of products) {
      const slug = item.slug ?? item.product_slug ?? item.productSlug;
      const quantity = item.quantity ?? 1;
      if (!slug || typeof slug !== 'string') {
        const err = new Error('Ogni prodotto deve avere uno slug valido');
        err.status = 400;
        return next(err);
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        const err = new Error("Quantità prodotto deve essere un numero intero positivo");
        err.status = 400;
        return next(err);
      }


      const [[product]] = await connection.execute(
        'SELECT id, name, slug, price, discount FROM products WHERE slug = ?',
        [slug.trim()]
      );

      if (!product) {
        const err = new Error(`Prodotto con slug "${slug}" non trovato`);
        err.status = 404;
        return next(err);
      }

      const discount = product.discount || 0;
      const priceAfterDiscount = product.price * (1 - discount / 100);
      const finalCost = Number((priceAfterDiscount * qty).toFixed(2));

      productsTotal += finalCost;

      await connection.execute(
        `INSERT INTO product_order 
         (order_id, product_id, product_slug, product_name,
          price_product, discount, quantity, final_cost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          product.id,
          product.slug,
          product.name,
          product.price,
          discount,
          qty,
          finalCost
        ]
      );
    }

    await connection.execute(
      `UPDATE orders SET orders_total_price = ? WHERE id = ?`,
      [Number(productsTotal), orderId]
    );

    await connection.commit();
    res.status(201).json({ message: 'Ordine creato con successo!', order_id: orderId });

  } catch (err) {
    await connection.rollback();
    console.error('Errore creazione ordine:', err.message);
    next(err);
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