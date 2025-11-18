const express = require('express');
const router = express.Router();
const productsControllers= require('../controllers/productControllers');

router.get('/', productsControllers.getProducts);
router.get('/:slug', productsControllers.getProductBySlug);
router.post('/', productsControllers.createProduct);
router.put('/:id', productsControllers.updateProduct);
router.delete('/:id', productsControllers.deleteProduct);

module.exports = router;
