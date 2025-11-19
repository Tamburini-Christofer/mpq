//todo Componente griglia prodotti riutilizzabile per Shop
import ProductCard from '../common/ProductCard';
import '../../styles/components/ProductGrid.css';

//todo Props:
//todo - products: array di prodotti da visualizzare
//todo - onViewDetails: callback per dettagli prodotto
//todo - onAddToCart: callback per aggiungere al carrello
//todo - variant: "grid" o "compact" per layout diversi
export default function ProductGrid({ 
  products = [], 
  onViewDetails, 
  onAddToCart,
  variant = "grid"
}) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid__empty">
        <p>Nessun prodotto trovato</p>
      </div>
    );
  }

  return (
    <div className={`product-grid product-grid--${variant}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id || index}
          product={product}
          variant="grid"
          onViewDetails={onViewDetails}
          onAddToCart={onAddToCart}
          showActions={true}
        />
      ))}
    </div>
  );
}
