const express = require('express');
const router = express.Router();
const productsControllers= require('../controllers/productControllers');

router.get('/', productsControllers.getProducts);
router.get('/:slug', productsControllers.getProductBySlug);
router.post('/', productsControllers.createProduct);

module.exports = router;
