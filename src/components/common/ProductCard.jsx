
import "../../styles/components/ProductCard.css";
import { useState } from "react";

// Funzione per generare slug SEO-friendly
const generateSlug = (name) => {
  return name
    if (variant === "compact") {
      const [expanded, setExpanded] = useState(false);
      return (
        <div className={`product-card product-card--compact ${typeClass}${expanded ? " expanded" : ""}`}>
          <img
            className={`product-card__image${expanded ? " expanded" : ""}`}
            src={product.image}
            alt={product.name}
          />

          <div className="product-card__info">
            <h3 className="product-card__title">{product.name}</h3>
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
            {product.description && (
              expanded ? (
                <p className="product-card__desc-full">{product.description}</p>
              ) : (
                <p className="product-card__desc">{product.description.slice(0, 45)}{product.description.length > 45 ? "..." : ""}</p>
              )
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
          </div>

          <div className="product-card__actions">
            <button
              className="product-card__btn product-card__btn--details small"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Nascondi" : "Dettagli"}
            </button>

            {qty === 0 ? (
              <button
                className="product-card__btn product-card__btn--cart small"
                onClick={handleAdd}
              >
                Acquista
              </button>
            ) : (
              <div className="product-qty-controls small">
                <button className="qty-btn small" onClick={handleDecrease}>
                  -
                </button>
                <span className="qty-display small">{qty}</span>
                <button className="qty-btn small" onClick={handleIncrease}>
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  const hasDiscount = discount > 0;
  const originalPrice = parseFloat(product.price) || 0;
  const finalPrice = hasDiscount
    ? originalPrice * (1 - discount / 100)
    : originalPrice;

  const displayBadge = hasDiscount ? "sale" : badge;
  const badgeData = badgeConfig[displayBadge];
  const typeClass = displayBadge ? `product-card--${displayBadge}` : "";

  const productSlug = generateSlug(product.name);

  // Versione compact
  if (variant === "compact") {
    return (
      <div className={`product-card product-card--compact ${typeClass}`}>
        <img
          className="product-card__image"
          src={product.image}
          alt={product.name}
        />

        <div className="product-card__info">
          <h3 className="product-card__title">{product.name}</h3>

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
          {product.description && (
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
        </div>

        <div className="product-card__actions">
          <button
            className="product-card__btn product-card__btn--details"
            onClick={() => onViewDetails && onViewDetails(productSlug)}
          >
            Dettagli
          </button>

          {qty === 0 ? (
            <button
              className="product-card__btn product-card__btn--cart"
              onClick={handleAdd}
            >
              Acquista
            </button>
          ) : (
            <div className="product-qty-controls">
              <button className="qty-btn" onClick={handleDecrease}>
                -
              </button>
              <span className="qty-display">{qty}</span>
              <button className="qty-btn" onClick={handleIncrease}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Versione griglia/shop/carousel
  return (
    <div className={`product-card product-card--${variant} ${typeClass}`}>
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

      <img
        className="product-card__image"
        src={product.image}
        alt={product.name}
      />

      <div className="product-card__info">
        <h3 className="product-card__title">{product.name}</h3>

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
              onClick={() => onViewDetails && onViewDetails(productSlug)}
            >
              Dettagli
            </button>

            {qty === 0 ? (
              <button
                className="product-card__btn product-card__btn--cart"
                onClick={handleAdd}
              >
                Acquista
              </button>
            ) : (
              <div className="product-qty-controls">
                <button className="qty-btn" onClick={handleDecrease}>
                  -
                </button>
                <span className="qty-display">{qty}</span>
                <button className="qty-btn" onClick={handleIncrease}>
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
