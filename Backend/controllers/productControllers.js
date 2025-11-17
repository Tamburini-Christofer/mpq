const getAllProducts = async (req, res) => {
    try {
        const rows = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM Products p 
      LEFT JOIN Category c ON p.category_id = c.id
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//GET: prodotto singolo

const getBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.name as category_name
            FROM Products p
            JOIN Category c on p.category_id = c.id
            WHERE p.slug = ?
             `, [slug])


        if (!rows.length) return res.status(404).json({ error: 'Prodotto non trovato' });

        res.json(response[0])
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}