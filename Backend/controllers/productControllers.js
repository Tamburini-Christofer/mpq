const db = require('../config/connection');
const slugify = require('slugify');
const HttpError = require('../utils/HttpError');

// SHOW

exports.getProducts = async (req, res, next) => {
    try {
        console.log('📦 Richiesta GET /products ricevuta');
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

        console.log('📝 Query SQL:', query);
        const [rows] = await db.query(query, params);
        console.log('✅ Prodotti trovati:', rows.length);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};


// SHOW SINGOLO
exports.getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const [rows] = await db.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             JOIN category c ON p.category_id = c.id
             WHERE p.slug = ?`,
            [slug]
        );

        if (rows.length === 0) {
            const err = new Error("Prodotto non trovato")
            err.status = 404;
            return next(err);
        }
        res.json(rows[0]);

    } catch (err) {
        next(err);
    }
};

// CREATE
exports.createProduct = async (req, res, next) => {
    try {
        const {
            name,
            slug,
            category_id,
            description,
            image,
            price,
            discount,
            popularity = 0,
            min_age
        } = req.body;


        if (category_id !== 1 && category_id !== 2 && category_id !== 3) {
            const err = new Error("le categorie possibili sono: 1 per film, 2 per serie tv, 3 per anime");
            err.status = 400;
            return next(err)
        }

        if (!name || !category_id || !image) {
            return next(new HttpError("Nome, categoria, prezzo e immagini sono obbligatori", 400));
        }

        if (typeof name !== "string" || typeof image !== "string" || typeof description !== "string") {
            const err = new Error("Il nome, immagine o descrizione inserita non è una stringa");
            err.status = 400;
            return next(err)
        }

        if (isNaN(price) || price <= 0 || price > 999.99) {
            const err = new Error("Prezzo non valido");
            err.status = 400;
            return next(err);
        }

        if (discount && (isNaN(discount) || discount < 0 || discount >= price)) {
            const err = new Error("Sconto non valido, dev'essere maggiore di zero e inferiore al prezzo originale.");
            err.status = 400;
            return next(err);
        }

        if (popularity && (isNaN(popularity) || popularity < 1 || popularity > 10)) {
            const err = new Error("popolarità non valida, inserire un valore da 1 a 10");
            err.status = 400;
            return next(err);
        }

        if (category_id < 0 || !category_id) {
            const err = new Error("id-categoria non esistente o non inserito.");
            err.status = 400;
            return next(err);
        }

        if (min_age < 0 || isNaN(min_age)) {
            const err = new Error("l'età non può essere un numero negativo o inferiore a 1 e dev'essere per forza un numero.");
            err.status = 400;
            return next(err);
        }


        let { disability } = req.body;
        disability = Number(disability);

        if ((disability !== 0 && disability !== 1) || isNaN(disability)) {
            const err = new Error("il valore può essere 0 se il prodotto è accessibile, 1 se non lo è.");
            err.status = 400;
            return next(err)
        }

        const finalSlug = slug || slugify(name, { lower: true, strict: true });

        const [existing] = await db.query("SELECT id FROM products WHERE slug = ?", [finalSlug]);
        if (existing.length > 0) {
            const err = new Error("Slug già trovato, cambiare nome per evitare duplicati")
            err.status = 400;
            return next(err);
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
        next(err);
    }
};

// UPDATE 
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            name,
            slug,
            category_id,
            description,
            image,
            price,
            discount,
            popularity
        } = req.body;

        const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Prodotto non trovato" });
        }

        let finalSlug = slug || existing[0].slug;
        if (name && !slug) {
            finalSlug = slugify(name, { lower: true, strict: true });
        }

        const [duplicate] = await db.query(
            "SELECT id FROM products WHERE slug = ? AND id != ?",
            [finalSlug, id]
        );
        if (duplicate.length > 0) {
            const err = new Error("Slug già trovato, cambiare nome per evitare duplicati")
            err.status = 400;
            return next(err);
        }

        const fields = [];
        const params = [];

        const addField = (col, val) => {
            fields.push(`${col} = ?`);
            params.push(val);
        };

        if (name) addField("name", name);
        if (category_id) addField("category_id", category_id);
        if (description !== undefined) addField("description", description);
        if (image !== undefined) addField("image", image);
        if (price !== undefined) addField("price", price);
        if (discount !== undefined) addField("discount", discount);
        if (popularity !== undefined) addField("popularity", popularity);
        if (finalSlug) addField("slug", finalSlug);

        if (fields.length === 0) {
            const err = new Error("Nessun campo da aggiornare.")
            err.status = 400;
            return next(err);
        }

        params.push(id);

        const query = `
            UPDATE products
            SET ${fields.join(", ")}
            WHERE id = ?
        `;

        await db.query(query, params);

        res.json({
            message: "Prodotto aggiornato con successo",
            updated_slug: finalSlug
        });

    } catch (err) {
        next(err);
    }
};

//DELETE

exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query("SELECT id FROM products WHERE id = ?", [id]);
        if (existing.length === 0) {
            const err = new Error("Prodotto non trovato")
            err.status = 404;
            return next(err);
        }

        await db.query("DELETE FROM products WHERE id = ?", [id]);

        res.json({ message: "Prodotto eliminato con successo" });

    } catch (err) {
        next(err);
    }
};

