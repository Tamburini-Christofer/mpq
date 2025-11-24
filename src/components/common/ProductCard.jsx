
import "../../styles/components/ProductCard.css";
import React, { useState } from "react";

// Funzione per generare slug SEO-friendly
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function ProductCard({
  product,
  variant = "grid",
  badge,
  onViewDetails,
  onAddToCart,
  onIncrease,
  onDecrease,
  qty = 0,
  showActions = true,
}) {
  // Configurazione badge
  const badgeConfig = {
    popular: { text: "Popolare", className: "badge-popular" },
    new: { text: "Novità", className: "badge-new" },
    sale: { text: "Offerta", className: "badge-sale" },
    related: { text: "Correlato", className: "badge-related" },
    wishlist: { text: "Wishlist", className: "badge-wishlist" },
    grid: { text: "", className: "" },
    compact: { text: "", className: "" },
    carousel: { text: "", className: "" },
  };

  // Stato espansione per la variante compatta
  const [expanded, setExpanded] = useState(false);
  // Stato locale per mostrare i controlli quantità dopo il primo acquisto
  const [showQtyControls, setShowQtyControls] = useState(qty > 0);
  React.useEffect(() => {
    setShowQtyControls(qty > 0);
  }, [qty]);

  const discount = product.discount || 0;
  const hasDiscount = discount > 0;
  const originalPrice = parseFloat(product.price) || 0;
  const finalPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice;
  const displayBadge = hasDiscount ? "sale" : badge;
  const badgeData = badgeConfig[displayBadge];
  const productSlug = generateSlug(product.name);
  const typeClass = variant === "compact" ? (expanded ? "expanded" : "collapsed") : "";
  const [isInWishlist, setIsInWishlist] = useState(product.isInWishlist || false);

  // Gestione wishlist (placeholder)
  const toggleWishlist = () => setIsInWishlist((prev) => !prev);

  // Gestione quantità: ora delegata alle funzioni prop

  // Unico wrapper per tutte le varianti
  return (
    <div className={`product-card product-card--${variant} ${typeClass}`}
      onClick={variant === "compact" ? () => setExpanded((prev) => !prev) : undefined}
      style={variant === "compact" ? { cursor: "pointer" } : {}}
    >
      {badgeData && (
        <span className={`product-card__badge ${badgeData.className}`}>
          {hasDiscount ? `-${discount}%` : badgeData.text}
        </span>
      )}

      <button
        className={`product-card__wishlist-btn ${isInWishlist ? "active" : ""}`}
        onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
      >
        {isInWishlist ? "♥" : "♡"}
      </button>

      <img
        className="product-card__image"
        src={product.image}
        alt={product.name}
      />

      <div className="product-card__info">
        <h3 className="product-card__title">{product.name}</h3>

        {variant === "compact" && (
          <div className="product-card__meta">
            <span className="product-card__category">
              Categoria: {
                product.category_id === 1 ? "Film" :
                product.category_id === 2 ? "Serie TV" :
                product.category_id === 3 ? "Anime" : "Altro"
              }
            </span>
            {product.stock !== undefined && (
              <span className="product-card__stock">Disponibilità: {product.stock > 0 ? `Disponibile (${product.stock})` : "Non disponibile"}</span>
            )}
          </div>
        )}

        {variant === "compact" && product.description && (
          <p className="product-card__desc">{product.description.slice(0, 45)}{product.description.length > 45 ? "..." : ""}</p>
        )}

        {hasDiscount ? (
          <div className="product-card__price-container">
            <span className="product-card__price--discount">
              {finalPrice.toFixed(2)}€
            </span>
            <span
              className="product-card__price--original"
              data-original-price="true"
            >
              {originalPrice.toFixed(2)}€
            </span>
          </div>
        ) : (
          <p className="product-card__price">{originalPrice.toFixed(2)}€</p>
        )}

        {showActions && (
          <div className="product-card__actions">
            <button
              className="product-card__btn product-card__btn--details"
              onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(productSlug); }}
            >
              Dettagli
            </button>

            {!showQtyControls ? (
              <button
                className="product-card__btn product-card__btn--cart"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart && onAddToCart(product);
                  setShowQtyControls(true);
                }}
              >
                Acquista
              </button>
            ) : (
              <div className="product-qty-controls">
                <button className="qty-btn" onClick={(e) => { e.stopPropagation(); onDecrease && onDecrease(product.id); }}>
                  -
                </button>
                <span className="qty-display">{qty}</span>
                <button className="qty-btn" onClick={(e) => { e.stopPropagation(); onIncrease && onIncrease(product.id); }}>
                  +
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;


