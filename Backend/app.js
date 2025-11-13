require('dotenv').config();
const db = require('./connection.js');
const express = require('express');

const app = express();
const PORT = 3000;

//test connessione del database
// app.get('/test-db', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT 1+1 AS solution');
//         res.json({ message: 'db connesso', result: rows[0].solution });
//     } catch (err) {
//         res.status(500).json({ error: 'DB NON RAGGIUNGIBILE', details: err.message })
//     }
// });

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
    // console.log(`Test DB → http://localhost:${PORT}/test-db`);
});