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

  const badgeData = badgeConfig[badge];

  return (
    <div className={`product-card product-card--${variant}`}>
      {/* todo: Badge se specificato */}
      {badgeData && (
        <span className={`product-card__badge ${badgeData.className}`}>
          {badgeData.text}
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
        <p className="product-card__price">{product.price.toFixed(2)}€</p>

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
