const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'JSON', 'products.json');
const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const modifiedProducts = products.map((product, index) => {
  const newProduct = { ...product };
  
  // Rimuovi id
  delete newProduct.id;
  
  // Assegna category_id
  if (index < 50) {
    newProduct.category_id = 1;
  } else if (index < 100) {
    newProduct.category_id = 2;
  } else {
    newProduct.category_id = 3;
  }
  
  // Aggiungi i nuovi campi
  newProduct.discount = '';
  newProduct.popularity = 0;
  newProduct.min_age = Math.floor(Math.random() * 19); // 0-18
  newProduct.disability = 0;
  newProduct.shipping_price = '';
  
  return newProduct;
});

fs.writeFileSync(filePath, JSON.stringify(modifiedProducts, null, 4), 'utf8');
console.log('File products.json modificato con successo!');
