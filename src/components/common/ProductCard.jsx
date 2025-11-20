//todo Importiamo gli stili della card prodotto
import "../../styles/components/ProductCard.css";

//todo Funzione per generare slug SEO-friendly dal nome prodotto
//todo Converte "Il Padrino" → "il-padrino"
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

//todo Componente card prodotto riutilizzabile
//todo Props:
//todo - product: oggetto prodotto con {name, price, image}
//todo - badge: tipo di badge ("popular", "new", "sale", null)
//todo - variant: variante di visualizzazione ("carousel", "grid", "compact")
//todo - onViewDetails: callback per visualizzare dettagli (riceve slug)
//todo - onAddToCart: callback per aggiungere al carrello
//todo - showActions: boolean per mostrare/nascondere pulsanti
export default function ProductCard({ 
  product, 
  badge = null,
  variant = "carousel",
  onViewDetails = null, 
  onAddToCart = null,
  showActions = true
}) {
  if (!product) return null;

  //todo Genera lo slug dal nome del prodotto
  const productSlug = generateSlug(product.name);

  //todo Mappa i tipi di badge alle classi CSS e testi
  const badgeConfig = {
    popular: { className: "product-card__badge--popular", text: "POPOLARE" },
    new: { className: "product-card__badge--new", text: "NUOVO ARRIVO" },
    sale: { className: "product-card__badge--sale", text: "OFFERTA" }
  };

  //todo Determina il badge da mostrare: se c'è sconto automatico, mostra badge sale
  const hasDiscount = product.discount && typeof product.discount === 'number' && product.discount > 0;
  const displayBadge = hasDiscount ? 'sale' : badge;
  const badgeData = badgeConfig[displayBadge];

  //todo Calcola prezzo originale e prezzo finale se c'è sconto
  const originalPrice = product.price;
  const finalPrice = hasDiscount ? originalPrice * (1 - product.discount / 100) : originalPrice;

  return (
    <div className={`product-card product-card--${variant}`}>
      {/* todo: Badge se specificato o se c'è uno sconto */}
      {badgeData && (
        <span className={`product-card__badge ${badgeData.className}`}>
          {hasDiscount ? `-${product.discount}%` : badgeData.text}
        </span>
      )}

      {/* todo: Immagine prodotto */}
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-card__image" 
      />

      {/* todo: Informazioni prodotto */}
      <div className="product-card__info">
        <h3 className="product-card__title">{product.name}</h3>
        
        {/* todo: Mostra prezzi in base a presenza sconto */}
        {hasDiscount ? (
          <div className="product-card__price-container">
            <span className="product-card__price product-card__price--discount">
              {finalPrice.toFixed(2)}€
            </span>
            <span 
              className="product-card__price product-card__price--original"
              data-original-price="true"
            >
              {originalPrice.toFixed(2)}€
            </span>
          </div>
        ) : (
          <p className="product-card__price">{product.price.toFixed(2)}€</p>
        )}

        {/* todo: Pulsanti azione (se abilitati) */}
        {showActions && (onViewDetails || onAddToCart) && (
          <div className="product-card__actions">
            {/* todo: Pulsante dettagli - passa lo slug generato */}
            {onViewDetails && (
              <button
                className="product-card__btn product-card__btn--details"
                onClick={() => onViewDetails(productSlug)}
              >
                Dettagli
              </button>
            )}

            {/* todo: Pulsante carrello */}
            {onAddToCart && (
              <button
                className="product-card__btn product-card__btn--cart"
                onClick={() => onAddToCart(product)}
              >
                Acquista
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
