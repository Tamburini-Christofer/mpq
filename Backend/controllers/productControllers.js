const db = require('../config/connection');
const slugify = require('slugify');

exports.getProducts = async (req, res) => {
    try {
        const { category_id } = req.query;
        let query = `
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN category c ON p.category_id = c.id
        `;

        const params = []

        if (category_id) {
            query += " WHERE p.category_id = ? ";
            params.push(category_id);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             JOIN category c ON p.category_id = c.id
             WHERE p.slug = ?`,
            [slug]
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "Prodotto non trovato" });
        res.json(rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            slug,
            category_id,
            description,
            image,
            price,
            discount,
            popularity = 0
        } = req.body;

        if (!name || !category_id || !price) {
            return res.status(400).json({ message: "Nome, categoria e prezzo sono obbligatori" });
        }

        if (discount && (isNaN(discount) || discount < 0)) return res.status(400).json({ message: "Sconto non valido" });

        if (popularity && (isNaN(popularity) || popularity < 0)) return res.status(400).json({ message: "Popolarità non valida" });

        if (isNaN(price) || price < 0) return res.status(400).json({ message: "Prezzo non valido" });

        const finalSlug = slug || slugify(name, { lower: true, strict: true });

        const [existing] = await db.query("SELECT id FROM products WHERE slug = ?", [finalSlug]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Slug già esistente, cambialo" });
        }

        const [result] = await db.query(`
            INSERT INTO products 
            (name, slug, category_id, description, image, price, discount, popularity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, finalSlug, category_id, description || null, image || null, price, discount || 0, popularity]);

        res.status(201).json({
            message: "Prodotto creato con successo",
            product_id: result.insertId,
            slug: finalSlug
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

