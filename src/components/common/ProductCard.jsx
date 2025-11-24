
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
  onToggleWishlist,
}) {
  // Configurazione badge
  const badgeConfig = {
    popular: { text: "Popolare", className: "product-card__badge--popular" },
    new: { text: "Novità", className: "product-card__badge--new" },
    sale: { text: "Offerta", className: "product-card__badge--sale" },
    related: { text: "Correlato", className: "product-card__badge--related" },
    wishlist: { text: "Wishlist", className: "product-card__badge--wishlist" },
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
  // Determina la classe della card in base ai dati prodotto
  let cardTypeClass = variant === "compact" ? (expanded ? "expanded" : "collapsed") : "";
  if (product.isPopular) cardTypeClass += " product-card--popular";
  if (hasDiscount) cardTypeClass += " product-card--sale";
  if (product.isNew) cardTypeClass += " product-card--new";

  // Badge: priorità offerta > nuovo > popolare
  let displayBadge = null;
  if (hasDiscount) displayBadge = "sale";
  else if (product.isNew) displayBadge = "new";
  else if (product.isPopular) displayBadge = "popular";
  else displayBadge = badge;
  const badgeData = badgeConfig[displayBadge];
  const productSlug = generateSlug(product.name);
  const [isInWishlist, setIsInWishlist] = useState(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return wishlist.some(w => w.id === product.id);
  });

  React.useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsInWishlist(wishlist.some(w => w.id === product.id));
    const handler = () => {
      const updated = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsInWishlist(updated.some(w => w.id === product.id));
    };
    window.addEventListener("wishlistUpdate", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("wishlistUpdate", handler);
      window.removeEventListener("storage", handler);
    };
  }, [product.id]);

  // Gestione wishlist: aggiorna locale, globale e dispatcha evento
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const exists = wishlist.some(w => w.id === product.id);
    let updated;
    if (exists) {
      updated = wishlist.filter(w => w.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setIsInWishlist(!exists);
    window.dispatchEvent(new Event("wishlistUpdate"));
  };

  // Gestione quantità: ora delegata alle funzioni prop

  // Unico wrapper per tutte le varianti
  return (
    <div className={`product-card product-card--${variant} ${cardTypeClass}`}
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