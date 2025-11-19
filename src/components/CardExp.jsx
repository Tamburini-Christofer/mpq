import axios from "axios";
import "./cardExp.css" 


function CardExp ({ product }) {

  if (!product) return null;

  // Calcola il prezzo scontato se c'è uno sconto
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div className="card fancy-card">
      {/* Badge sconto se presente */}
      {hasDiscount && (
        <div className="discount-badge">
          -{product.discount}%
        </div>
      )}
      
      <div className="card-image-wrapper">
        <img src={product.image} alt={product.name} className="card-image" />
      </div>

      <div className="card-body">
        <h3>{product.name}</h3>
        <div className="price-container">
          {hasDiscount ? (
            <>
              <p className="price discounted-price">{discountedPrice.toFixed(2)}€</p>
              <p className="original-price">{product.price.toFixed(2)}€</p>
            </>
          ) : (
            <p className="price">{product.price.toFixed(2)}€</p>
          )}
        </div>
      </div>
    </div>

  )
}
export default CardExp;