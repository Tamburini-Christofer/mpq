//todo Importiamo gli stili della card
import "../../styles/components/cardExp.css" 

//todo Componente card riutilizzabile per visualizzare prodotti con pulsanti azione
//todo Props: product (oggetto prodotto), onViewDetails (callback per dettagli), onAddToCart (callback per carrello)
function CardExp ({ product, onViewDetails, onAddToCart }) {
  if (!product) return null;

  return (
    <>
      {/* todo: Immagine del prodotto */}
      <img src={product.image} alt={product.name} className="card-image" />
      <div className="card-info">
        {/* todo: Nome del prodotto */}
        <h3 className="card-title">{product.name}</h3>
        {/* todo: Prezzo formattato */}
        <p className="card-price">{product.price}€</p>
        
        {/* todo: Mostra i pulsanti solo se almeno una callback è fornita */}
        {(onViewDetails || onAddToCart) && (
          <div className="card-buttons">
            {/* todo: Pulsante dettagli - mostrato solo se callback fornita */}
            {onViewDetails && (
              <button 
                className="card-btn card-btn-details"
                onClick={() => onViewDetails(product)}
              >
                Dettagli
              </button>
            )}
{/* QUANTITÀ NEL CARRELLO */}
{showActions && (
  <div className="product-card__actions">
    {onViewDetails && (
      <button
        className="product-card__btn product-card__btn--details"
        onClick={() => onViewDetails(productSlug)}
      >
        Dettagli
      </button>
    )}

    {/* 🔥 SE LA QUANTITÀ È 0 → MOSTRA ACQUISTA */}
    {!product.cartQty || product.cartQty === 0 ? (
      <button
        className="product-card__btn product-card__btn--cart"
        onClick={() => onAddToCart(product)}
      >
        Acquista
      </button>
    ) : (
      /* 🔥 SE È >0 → MOSTRA I PULSANTI - QTY + */
      <div className="product-qty-controls">
        <button
          className="qty-btn minus"
          onClick={() => product.onDecrease(product.id)}
        >
          -
        </button>

        <span className="qty-display">{product.cartQty}</span>

        <button
          className="qty-btn plus"
          onClick={() => product.onIncrease(product.id)}
        >
          +
        </button>
      </div>
    )}
  </div>
)}

          </div>
        )}
      </div>
    </>
  )
}
export default CardExp;