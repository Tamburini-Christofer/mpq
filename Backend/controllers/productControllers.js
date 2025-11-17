const db = require('../config/connection');

exports.getProducts = async (req, res) => {
    try {
        const { category_id } = req.query;
        let query = `
        SELECT p.*, c.name as category_name
        FROM products P
        JOIN category c ON p.category_id = c.id
        `;

        const params = []

        if (category_id) {
            query += "WHERE p.category_id = ?";
            params.push(category_id);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
            } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

