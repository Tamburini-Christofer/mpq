require('dotenv').config();
const cors = require('cors');
const db = require('./config/connection.js');
const express = require('express');
const app = express();
const PORT = 3000;


app.use(cors({
    origin: 'http://localhost:5173',
    methods: [ 'GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// collegamento delle route per i prodotti
const productRoutes = require('./routes/productRoutes');
// collegamento della route per i pagamenti
const paymentRoutes = require('./routes/paymentRoutes');

//abilitazione lettura JSON
app.use(express.json());

//uso della route
app.use('/products', productRoutes);

//uso della route
app.use('/payment', paymentRoutes);

//rotta home
app.get("/", (req, res) => {
    console.log("hai richiesto la home page");
})


// Middleware globale errorHandler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});