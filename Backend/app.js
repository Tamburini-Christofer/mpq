require('dotenv').config();
const db = require('./config/connection.js');
const express = require('express');

const app = express();
const PORT = 3000;

// collegamento delle route per i prodotti
const productRoutes = require('./routes/productRoutes');

//abilitazione lettura JSON
app.use(express.json());
//uso della route
app.use('/products', productRoutes);

//todo Rotta home
app.get("/", (req, res) => {
    console.log("hai richiesto la home page");
    res.send('<h1>Home page</h1>')})

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
    // console.log(`Test DB → http://localhost:${PORT}/test-db`);
});