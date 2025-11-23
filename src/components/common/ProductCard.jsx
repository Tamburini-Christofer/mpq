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
  onIncrease = null,
  onDecrease = null,
  showActions = true,
  cart = []
}) {

  /* ======================================================
     WISHLIST
  ====================================================== */
  const [isInWishlist, setIsInWishlist] = useState(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return wishlist.some((i) => i.id === product.id);
  });

  const toggleWishlist = (e) => {
    e.stopPropagation();

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

    if (isInWishlist) {
      const updated = wishlist.filter((i) => i.id !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      wishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsInWishlist(true);
    }

    window.dispatchEvent(new Event("wishlistUpdate"));
  };

  /* ======================================================
     MOSTRA QUANTITÀ SE IL PRODOTTO È GIÀ NEL CARRELLO
  ====================================================== */
  const cartItem = cart.find((c) => c.id === product.id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = async () => {
    const newQty = await onAddToCart(product);
  };

  const handleIncrease = async () => {
    const newQty = await onIncrease(product.id);
  };

  const handleDecrease = async () => {
    const newQty = await onDecrease(product.id);
  };

  /* ======================================================
     BADGE & PREZZI
  ====================================================== */
  const badgeConfig = {
    popular: { className: "product-card__badge--popular", text: "POPOLARE" },
    new: { className: "product-card__badge--new", text: "NUOVO" },
    sale: { className: "product-card__badge--sale", text: "OFFERTA" },
  };

  const discount = parseFloat(product.discount) || 0;
  const hasDiscount = discount > 0;
  const originalPrice = parseFloat(product.price);
  const finalPrice = hasDiscount
    ? originalPrice * (1 - discount / 100)
    : originalPrice;

  const displayBadge = hasDiscount ? "sale" : badge;
  const badgeData = badgeConfig[displayBadge];

  const productSlug = generateSlug(product.name);

  /* ======================================================
     CARD VERSIONE LIST / COMPACT
  ====================================================== */
  if (variant === "compact") {
    return (
      <div className="product-card product-card--compact">

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
        </div>

        <div className="product-card__actions">
          {/* Dettagli */}
          <button
            className="product-card__btn product-card__btn--details"
            onClick={() => onViewDetails(productSlug)}
          >
            Dettagli
          </button>

          {/* Acquista + Qty */}
          {qty === 0 ? (
            <button
              className="product-card__btn product-card__btn--cart"
              onClick={handleAdd}
            >
              Acquista
            </button>
          ) : (
            <div className="product-qty-controls">
              <button className="qty-btn" onClick={handleDecrease}>-</button>
              <span className="qty-display">{qty}</span>
              <button className="qty-btn" onClick={handleIncrease}>+</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ======================================================
     CARD VERSIONE GRIGLIA (SHOP)
  ====================================================== */
  return (
    <div className={`product-card product-card--${variant}`}>

      {/* Badge */}
      {badgeData && (
        <span className={`product-card__badge ${badgeData.className}`}>
          {hasDiscount ? `-${discount}%` : badgeData.text}
        </span>
      )}

      {/* Cuore / Wishlist */}
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

        {/* BOTTONI / QTY */}
        {showActions && (
          <div className="product-card__actions">

            {/* Dettagli */}
            <button
              className="product-card__btn product-card__btn--details"
              onClick={() => onViewDetails(productSlug)}
            >
              Dettagli
            </button>

            {/* Se qty = 0 → Mostra Acquista */}
            {qty === 0 ? (
              <button
                className="product-card__btn product-card__btn--cart"
                onClick={handleAdd}
              >
                Acquista
              </button>
            ) : (
              <div className="product-qty-controls">
                <button className="qty-btn" onClick={handleDecrease}>-</button>
                <span className="qty-display">{qty}</span>
                <button className="qty-btn" onClick={handleIncrease}>+</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
