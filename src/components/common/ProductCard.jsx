
import "../../styles/components/ProductCard.css";
import React, { useState } from "react";
import { cartAPI, emitCartUpdate, emitCartAction } from "../../services/api";
import { logAction } from '../../utils/logger';
import ACTIONS from '../../utils/actionTypes';
import { toast } from 'react-hot-toast';

// Funzione per generare slug SEO-friendly
const generateSlug = (name) => {
  if (!name) return "";
  // normalizza i caratteri accentati in ASCII (es. è -> e), poi sostituisce i non-alphanumerici
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD') // decomposes accents
    .replace(/\p{Diacritic}/gu, '') // rimuove i diacritici
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
  listLayout = false,
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
  // displayQty: stato locale mostrato nella UI (sincronizzato con prop `qty` o `product.cartQty`)
  const [displayQty, setDisplayQty] = useState(() => {
    return qty || product.cartQty || 0;
  });

  React.useEffect(() => {
    setShowQtyControls((q) => (qty > 0 ? true : q));
  }, [qty]);

  // Mantieni displayQty sincronizzato con le props esterne
  React.useEffect(() => {
    const next = qty || product.cartQty || 0;
    setDisplayQty(next);
    if (next > 0) setShowQtyControls(true);
  }, [qty, product.cartQty]);

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
  // Usa lo slug già fornito dal backend se presente; altrimenti generalo in modo compatibile
  const productSlug = product.slug ? product.slug : generateSlug(product.name);
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
    // Se il componente genitore ha fornito un handler, usalo (evita doppia scrittura)
    if (onToggleWishlist) {
      // Aggiornamento ottimistico dell'UI
      setIsInWishlist(prev => !prev);
      try {
        onToggleWishlist(product);
      } catch {
        // se fallisce, rollback dello stato locale
        setIsInWishlist(prev => !prev);
      }
      return;
    }

    // Fallback: gestione locale se non esiste handler esterno
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const exists = wishlist.some(w => w.id === product.id);
    let updated;
    let action;
    if (exists) {
      updated = wishlist.filter(w => w.id !== product.id);
      action = 'remove';
    } else {
      updated = [...wishlist, product];
      action = 'add';
    }
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setIsInWishlist(!exists);
    window.dispatchEvent(new CustomEvent("wishlistUpdate", { detail: { action, product } }));
    // mostra notifica globale
    if (action === 'add') {
      toast.success(`${product.name} aggiunto alla wishlist`, {
        icon: '🤍',
        style: { background: '#ef4444', color: '#ffffff' }
      });
      // dev-friendly concise log
      logAction(ACTIONS.WISHLIST_ADD, { id: product.id, name: product.name });
    } else {
      toast(`${product.name} rimosso dalla wishlist`, {
        icon: '❤',
        style: { background: '#ffffff', color: '#ef4444', border: '1px solid #ef4444' }
      });
      logAction(ACTIONS.WISHLIST_REMOVE, { id: product.id, name: product.name });
    }
  };

  // Sincronizza displayQty con il carrello globale quando viene emesso cartUpdate
  React.useEffect(() => {
    let mounted = true;
    const handler = async (e) => {
      try {
        let currentCart;
        if (e && e.detail && e.detail.cart) {
          currentCart = e.detail.cart;
        } else {
          currentCart = await cartAPI.get();
        }
        if (!mounted) return;
        const item = currentCart.find(i => i.id === product.id);
        const qtyFromCart = item ? item.quantity : 0;
        setDisplayQty(qtyFromCart);
        if (qtyFromCart > 0) setShowQtyControls(true);
        else setShowQtyControls(false);
      } catch {
        // ignore
      }
    };
    window.addEventListener("cartUpdate", handler);
    // anche all'inizio sincronizziamo
    handler();
    return () => {
      mounted = false;
      window.removeEventListener("cartUpdate", handler);
    };
  }, [product.id]);

  // Gestione quantità: ora delegata alle funzioni prop

  // Variante 'list' (usata nella vista lista dello Shop): struttura a due colonne
  if (listLayout) {
    return (
      <div className={`product-card product-card--list ${cardTypeClass}`}>
        {badgeData && (
          <span className={`product-card__badge ${badgeData.className}`}>
            {hasDiscount ? `-${discount}%` : badgeData.text}
          </span>
        )}

        <button
          className={`product-card__wishlist-btn ${isInWishlist ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
          aria-pressed={isInWishlist}
          aria-label={isInWishlist ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        >
          <span className="heart">{isInWishlist ? "♥" : "♡"}</span>
        </button>

        <div className="product-card__list-left">
          <img
            className="product-card__image"
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />

          <div className="product-card__left-meta">
            <h3 className="product-card__title">{product.name}</h3>
            <div className="product-card__category">{product.category || (product.category_id === 1 ? 'Film' : product.category_id === 2 ? 'Serie TV' : product.category_id === 3 ? 'Anime' : '')}</div>
          </div>
        </div>

        <div className="product-card__list-right">
          {hasDiscount ? (
            <div className="product-card__price-container">
              <span className="product-card__price--discount">{finalPrice.toFixed(2)}€</span>
              <span className="product-card__price--original" data-original-price="true">{originalPrice.toFixed(2)}€</span>
            </div>
          ) : (
            <p className="product-card__price">{originalPrice.toFixed(2)}€</p>
          )}

          <p className="product-card__desc">{product.description}</p>

          <div className="product-card__actions">
            <button
              className="product-card__btn product-card__btn--details"
              onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(product.slug || product.id); }}
            >
              Dettagli
            </button>

            {!qty || qty === 0 ? (
              <button
                className="product-card__btn product-card__btn--cart"
                onClick={async (e) => { e.stopPropagation(); try { if (onAddToCart) await onAddToCart(product); else { await cartAPI.add(product.id, 1); emitCartUpdate(); emitCartAction('add', { id: product.id, name: product.name }); } } catch (err) { console.error(err); toast.error('Errore nell\'aggiunta al carretto'); } }}
              >
                Acquista
              </button>
            ) : (
              <div className="product-qty-controls">
                <button className="qty-btn" onClick={async (e) => { e.stopPropagation(); try { if (onDecrease) await onDecrease(product.id); else { await cartAPI.decrease(product.id); emitCartUpdate(); emitCartAction('remove', { id: product.id, name: product.name }); } } catch (err) { console.error(err); toast.error('Errore'); } }}>{"-"}</button>
                <span className="qty-display">{qty}</span>
                <button className="qty-btn" onClick={async (e) => { e.stopPropagation(); try { if (onIncrease) await onIncrease(product.id); else { await cartAPI.increase(product.id); emitCartUpdate(); emitCartAction('add', { id: product.id, name: product.name }); } } catch (err) { console.error(err); toast.error('Errore'); } }}>{"+"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
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
        aria-pressed={isInWishlist}
        aria-label={isInWishlist ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      >
        <span className="heart">{isInWishlist ? "♥" : "♡"}</span>
      </button>

      <img
        className="product-card__image"
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
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
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    // delega se il genitore gestisce l'aggiunta (parent shows toast/side feedback)
                    if (onAddToCart) {
                      await onAddToCart(product);
                      // parent is responsible for emitting cartAction / showing toasts
                    } else {
                      await cartAPI.add(product.id, 1);
                      emitCartUpdate();
                      // emit a single centralized cartAction so Layout shows the toast
                      emitCartAction('add', { id: product.id, name: product.name });
                    }

                    setDisplayQty((d) => (d > 0 ? d : 1));
                    setShowQtyControls(true);
                  } catch (err) {
                    console.error('Errore aggiunta al carrello:', err);
                    toast.error("Errore nell'aggiunta al carretto");
                  }
                }}
              >
                Acquista
              </button>
            ) : (
              <div className="product-qty-controls">
                <button className="qty-btn" onClick={async (e) => {
                  e.stopPropagation();
                  setDisplayQty((d) => {
                    const next = Math.max(d - 1, 0);
                    if (next === 0) setShowQtyControls(false);
                    return next;
                  });
                  try {
                    if (onDecrease) {
                      // delegate to parent; parent is responsible for emitting cartAction
                      await Promise.resolve(onDecrease(product.id));
                    } else {
                      await cartAPI.decrease(product.id);
                      emitCartUpdate();
                      // centralized notification for minus action when card handles API directly
                      emitCartAction('remove', { id: product.id, name: product.name });
                    }
                  } catch (err) {
                    console.error('Errore nella diminuzione quantità:', err);
                    toast.error("Errore nell'aggiornamento del carretto");
                  }
                }}>
                  -
                </button>
                <span className="qty-display">{displayQty}</span>
                <button className="qty-btn" onClick={async (e) => {
                  e.stopPropagation();
                  setDisplayQty((d) => d + 1);
                  try {
                    if (onIncrease) {
                      // delegate to parent; parent should emit cartAction if needed
                      await Promise.resolve(onIncrease(product.id));
                    } else {
                      await cartAPI.increase(product.id);
                      emitCartUpdate();
                      // centralized notification for plus action when card handles API directly
                      emitCartAction('add', { id: product.id, name: product.name });
                    }
                    } catch (err) {
                    console.error('Errore nell\'aumento quantità:', err);
                    toast.error("Errore nell'aggiornamento del carretto");
                  }
                }}>
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