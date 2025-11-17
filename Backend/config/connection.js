require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PSW,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

module.exports = pool.promise();

// === TEST CONNESSIONE AL DB (senza query) ===
(async () => {
  try {
    await pool.execute('SELECT 1');
    console.log('DB CONNESSO!');
  } catch (err) {
    console.error('ERRORE CONNESSIONE DB:', err.message);
  }
})();