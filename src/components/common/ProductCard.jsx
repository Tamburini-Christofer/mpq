//todo Importiamo gli stili della card prodotto
import "../../styles/components/ProductCard.css";
import { useState, useEffect } from "react";

//todo Funzione per generare slug SEO-friendly
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

export default function ProductCard({
  product,
  badge = null,
  variant = "carousel",
  onViewDetails = null,
  onAddToCart = null,
  showActions = true
}) {

  const [isInWishlist, setIsInWishlist] = useState(() => {
    if (!product) return false;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some(item => item.name === product.name);
  });

  useEffect(() => {
    if (!product) return;

    const checkWishlistStatus = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.some(item => item.name === product.name));
    };

    window.addEventListener('wishlistUpdate', checkWishlistStatus);
    window.addEventListener('storage', checkWishlistStatus);

    return () => {
      window.removeEventListener('wishlistUpdate', checkWishlistStatus);
      window.removeEventListener('storage', checkWishlistStatus);
    };
  }, [product]);

  if (!product) return null;

  const productSlug = generateSlug(product.name);

  const toggleWishlist = (e) => {
    e.stopPropagation();

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

    if (isInWishlist) {
      const updated = wishlist.filter(item => item.name !== product.name);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
    }

    window.dispatchEvent(new Event("wishlistUpdate"));
  };

  // badge
  const badgeConfig = {
    popular: { className: "product-card__badge--popular", text: "POPOLARE" },
    new:     { className: "product-card__badge--new",     text: "NUOVO" },
    sale:    { className: "product-card__badge--sale",    text: "OFFERTA" },
  };

  const discount = parseFloat(product.discount) || 0;
  const hasDiscount = discount > 0;
  const originalPrice = parseFloat(product.price) || 0;
  const finalPrice = hasDiscount
    ? originalPrice * (1 - discount / 100)
    : originalPrice;

  const displayBadge = hasDiscount ? "sale" : badge;
  const badgeData = badgeConfig[displayBadge];

  /*
  =====================================================
  |                LIST (COMPACT) MODE                |
  =====================================================
  */
  if (variant === "compact") {
    return (
      <div className="mpq-list-card">

        <div className="mpq-list-thumb">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="mpq-list-content">
          <h3 className="mpq-list-title">{product.name}</h3>

          <div className="mpq-list-price">
            {hasDiscount ? (
              <>
                <span className="old-price">{originalPrice.toFixed(2)}€</span>
                <span className="discounted-price">
                  {finalPrice.toFixed(2)}€
                </span>
              </>
            ) : (
              <span>{originalPrice.toFixed(2)}€</span>
            )}
          </div>

          <div className="mpq-list-info">
            <p><strong>Categoria:</strong> {product.category}</p>
            <p><strong>Età:</strong> {product.min_age}+</p>
            <p><strong>Disponibilità:</strong> {product.stock > 0 ? "Disponibile" : "Esaurito"}</p>
            <p><strong>Rating:</strong> ⭐ {product.rating || "N/D"}</p>
          </div>

          {product.short_description && (
            <p className="mpq-list-desc">
              {product.short_description.length > 90
                ? product.short_description.slice(0, 90) + "..."
                : product.short_description}
            </p>
          )}
        </div>

        <div className="mpq-list-actions">
          {onViewDetails && (
            <button
              className="btn-details"
              onClick={() => onViewDetails(productSlug)}
            >
              Dettagli
            </button>
          )}

          {onAddToCart && (
            <button
              className="btn-buy"
              onClick={() => onAddToCart(product)}
            >
              Aggiungi
            </button>
          )}
        </div>
      </div>
    );
  }

  /*
  =====================================================
  |                  VERSIONE GRID                     |
  =====================================================
  */
  return (
    <div className={`product-card product-card--${variant}`}>

      {badgeData && (
        <span className={`product-card__badge ${badgeData.className}`}>
          {hasDiscount ? `-${discount}%` : badgeData.text}
        </span>
      )}

      <button
        className={`product-card__wishlist-btn ${isInWishlist ? "active" : ""}`}
        onClick={toggleWishlist}
      >
        {isInWishlist ? "♥" : "♡"}
      </button>

      <img className="product-card__image" src={product.image} alt={product.name} />

      <div className="product-card__info">
        <h3 className="product-card__title">{product.name}</h3>

        {hasDiscount ? (
          <div className="product-card__price-container">
            <span className="product-card__price product-card__price--discount">
              {finalPrice.toFixed(2)}€
            </span>
            <span className="product-card__price product-card__price--original">
              {originalPrice.toFixed(2)}€
            </span>
          </div>
        ) : (
          <p className="product-card__price">{originalPrice.toFixed(2)}€</p>
        )}

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
