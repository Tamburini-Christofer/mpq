const db = require('../config/connection');

// Carrello temporaneo in memoria (per sessione utente)
// In produzione usare Redis o database
const carts = new Map();

// GET - Recupera carrello per sessionId
exports.getCart = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        
        if (!carts.has(sessionId)) {
            carts.set(sessionId, []);
        }
        
        const cart = carts.get(sessionId);
        
        // Arricchisci con dati prodotti dal database
        const enrichedCart = await Promise.all(
            cart.map(async (item) => {
                const [rows] = await db.query(
                    `SELECT p.*, c.name as category_name
                     FROM products p
                     JOIN category c ON p.category_id = c.id
                     WHERE p.id = ?`,
                    [item.productId]
                );
                
                if (rows.length > 0) {
                    return {
                        ...rows[0],
                        quantity: item.quantity,
                        cartItemId: item.productId
                    };
                }
                return null;
            })
        );
        
        res.json(enrichedCart.filter(item => item !== null));
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
            const err = new Error("productId è obbligatorio");
            err.status = 400;
            return next(err);
        }
        
        // Verifica che il prodotto esista
        const [product] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
        if (product.length === 0) {
            const err = new Error("Prodotto non trovato");
            err.status = 404;
            return next(err);
        }
        
        if (!carts.has(sessionId)) {
            carts.set(sessionId, []);
        }
        
        const cart = carts.get(sessionId);
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }
        
        res.json({ 
            message: "Prodotto aggiunto al carrello",
            cart: cart
        });
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
        const item = cart.find(item => item.productId === parseInt(productId));
        
        if (!item) {
            const err = new Error("Prodotto non trovato nel carrello");
            err.status = 404;
            return next(err);
        }
        
        item.quantity = quantity;
        
        res.json({
            message: "Quantità aggiornata",
            cart: cart
        });
    } catch (err) {
        next(err);
    }
};

// DELETE - Rimuovi dal carrello
exports.removeFromCart = async (req, res, next) => {
    try {
        const { sessionId, productId } = req.params;
        
        if (!carts.has(sessionId)) {
            const err = new Error("Carrello non trovato");
            err.status = 404;
            return next(err);
        }
        
        const cart = carts.get(sessionId);
        const index = cart.findIndex(item => item.productId === parseInt(productId));
        
        if (index === -1) {
            const err = new Error("Prodotto non trovato nel carrello");
            err.status = 404;
            return next(err);
        }
        
        cart.splice(index, 1);
        
        res.json({
            message: "Prodotto rimosso dal carrello",
            cart: cart
        });
    } catch (err) {
        next(err);
    }
};

// DELETE - Svuota carrello
exports.clearCart = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        carts.set(sessionId, []);
        
        res.json({
            message: "Carrello svuotato",
            cart: []
        });
    } catch (err) {
        next(err);
    }
};
