require('dotenv').config();
const cors = require('cors');
const connection = require('./config/connection.js');
const express = require('express');
const app = express();
const PORT = 3000;


// Allow CORS from any localhost dev port (useful when Vite picks a free port)
// Development CORS: reflect the request origin for localhost and allow credentials
app.use(cors({
    origin: true, // reflect request origin
    methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// collegamento delle route per i prodotti
const productRoutes = require('./routes/productRoutes');
// collegamento della route per i pagamenti
const paymentRoutes = require('./routes/paymentRoutes');
//collegamento della route per la email
const stripeWebHook = require('./routes/StripeWebhook.js')
app.use('/webhook', stripeWebHook);
// collegamento della route per il carrello
const cartRoutes = require('./routes/cartRoutes');
// collegamento della route per il checkout
const checkoutRoutes = require('./routes/checkoutRoutes');

//abilitazione lettura JSON
app.use(express.json());

//uso della route
app.use('/products', productRoutes);

//uso della route
app.use('/payment', paymentRoutes);

//uso della route per il carrello
app.use('/cart', cartRoutes);

//uso della route per il checkout
app.use('/checkout', checkoutRoutes);

//uso della route
app.use('/orders', require('./routes/ordersRouter.js'));


// Middleware globale errorHandler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});