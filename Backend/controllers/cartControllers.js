// controllers/cartControllers.js
const db = require('../config/connection');

// Carrelli in memoria (mappa: sessionId -> array di oggetti)
const carts = new Map();

// GET - Ottieni carrello
exports.getCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!carts.has(sessionId)) {
      carts.set(sessionId, []);
    }

    const cart = carts.get(sessionId);

    const enriched = await Promise.all(
      cart.map(async (item) => {
        const [rows] = await db.query(
          `SELECT p.*, c.name AS category_name
           FROM products p
           JOIN category c ON p.category_id = c.id
           WHERE p.id = ?`,
          [item.productId]
        );

        if (rows.length === 0) return null;

        return {
          ...rows[0],
          quantity: item.quantity
        };
      })
    );

    res.json(enriched.filter(Boolean));
  } catch (err) {
    next(err);
  }
};

// POST - Aggiungi al carrello
exports.addToCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return next(new Error("productId è obbligatorio"));
    }

    const [prod] = await db.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (prod.length === 0) {
      const err = new Error("Prodotto non trovato");
      err.status = 404;
      return next(err);
    }

    if (!carts.has(sessionId)) carts.set(sessionId, []);

    const cart = carts.get(sessionId);

    const exists = cart.find((i) => i.productId === productId);

    if (exists) {
      exists.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    res.json({ message: "Aggiunto!", cart });
  } catch (err) {
    next(err);
  }
};

// PUT - Aggiorna quantità
exports.updateCartItem = async (req, res, next) => {
  try {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      const err = new Error("Quantità non valida");
      err.status = 400;
      return next(err);
    }

    if (!carts.has(sessionId)) {
      const err = new Error("Carrello non trovato");
      err.status = 404;
      return next(err);
    }

    const cart = carts.get(sessionId);

    const item = cart.find(
      (i) => i.productId === parseInt(productId)
    );

    if (!item) {
      const err = new Error("Prodotto non nel carrello");
      err.status = 404;
      return next(err);
    }

    item.quantity = quantity;

    res.json({ message: "Quantità aggiornata", cart });
  } catch (err) {
    next(err);
  }
};

// DELETE - Rimuovi un item
exports.removeFromCart = async (req, res, next) => {
  try {
    const { sessionId, productId } = req.params;

    if (!carts.has(sessionId)) {
      const err = new Error("Carrello non trovato");
      err.status = 404;
      return next(err);
    }

    const cart = carts.get(sessionId);
    const index = cart.findIndex(
      (i) => i.productId === parseInt(productId)
    );

    if (index === -1) {
      const err = new Error("Prodotto non nel carrello");
      err.status = 404;
      return next(err);
    }

    cart.splice(index, 1);

    res.json({ message: "Prodotto rimosso", cart });
  } catch (err) {
    next(err);
  }
};

// DELETE - Svuota carrello
exports.clearCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    carts.set(sessionId, []);

    res.json({ message: "Carrello svuotato", cart: [] });
  } catch (err) {
    next(err);
  }
};
