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
            {/* todo: Pulsante acquista - mostrato solo se callback fornita */}
            {onAddToCart && (
              <button 
                className="card-btn card-btn-cart"
                onClick={() => onAddToCart(product)}
              >
                Acquista
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
export default CardExp;