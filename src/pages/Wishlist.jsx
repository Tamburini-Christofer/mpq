// Wishlist.jsx
import "../styles/pages/Wishlist.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/common/ProductCard";
import { cartAPI, emitCartUpdate, emitCartAction } from "../services/api";
import { logAction, error as logError } from '../utils/logger';
import ACTIONS from '../utils/actionTypes';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cart, setCart] = useState([]);

  const loadWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlistItems(wishlist);
  };

  const loadCart = async () => {
    try {
      const cartData = await cartAPI.get();
      setCart(cartData);
    } catch (error) {
      logError("Errore caricamento carretto", error);
    }
  };

  useEffect(() => {
    loadWishlist();
    loadCart();
    window.addEventListener("storage", loadWishlist);
    window.addEventListener("wishlistUpdate", loadWishlist);
    const handler = (e) => {
      if (e && e.detail && e.detail.cart) setCart(e.detail.cart);
      else loadCart();
    };
    window.addEventListener("cartUpdate", handler);

    return () => {
      window.removeEventListener("storage", loadWishlist);
      window.removeEventListener("wishlistUpdate", loadWishlist);
      window.removeEventListener("cartUpdate", handler);
    };
  }, []);

  // notifications via react-hot-toast

  const handleViewDetails = (slug) => {
    navigate(`/details/${slug}`);
  };

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.add(product.id, 1);
      await loadCart(); // aggiorna lo stato locale
      emitCartUpdate(); // notifica altri componenti
      // notifica centralizzata per mostrare il toast laterale
      emitCartAction('add', { id: product.id, name: product.name });
    } catch (error) {
      toast.error("Errore nell'aggiunta al carretto");
      logError('Errore aggiunta wishlist->carretto', error);
    }
  };

  const handleRemoveFromWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      window.dispatchEvent(new Event("wishlistUpdate"));
      // styled toast: removal -> white bg with red heart
      toast(`"${product.name}" rimosso dalla wishlist`, {
        icon: '❤',
        style: { background: '#ffffff', color: '#ef4444', border: '1px solid #ef4444' }
      });
      logAction(ACTIONS.WISHLIST_REMOVE, { id: product.id, name: product.name });
  };

  const handleClearWishlist = async () => {
    const result = await Swal.fire({
      title: 'Svuotare la wishlist?',
      text: 'Questa azione rimuoverà tutti i prodotti salvati nella tua wishlist.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Svuota wishlist',
      cancelButtonText: 'Annulla',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal-dark-popup',
        title: 'swal-dark-title',
        content: 'swal-dark-content',
        confirmButton: 'swal-dark-confirm',
        cancelButton: 'swal-dark-cancel'
      }
    });

    if (result.isConfirmed) {
      localStorage.setItem("wishlist", JSON.stringify([]));
      setWishlistItems([]);
      window.dispatchEvent(new Event("wishlistUpdate"));
      // mostra un feedback compatto con icona di check (nessuna animazione)
      await Swal.fire({
        html: `
          <div class="swal-check-wrap">
            <div class="swal-check-icon" aria-hidden="true">✓</div>
            <div class="swal-check-label">Wishlist svuotata</div>
          </div>
        `,
        timer: 1200,
        showConfirmButton: false,
        customClass: { popup: 'swal-dark-popup' },
        didOpen: (popup) => {
          const icon = popup.querySelector('.swal-check-icon');
          if (icon) {
            // animate the check using CSS class (SweetAlert2 opens the popup first)
            setTimeout(() => icon.classList.add('animate'), 40);
          }
        }
      });
    }
  };

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    try {
      const result = await Swal.fire({
        title: `Aggiungere ${wishlistItems.length} prodotti al carretto?`,
        text: 'Questa azione aggiungerà tutti i prodotti presenti nella wishlist al carretto.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aggiungi tutti',
        cancelButtonText: 'Annulla',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content',
          confirmButton: 'swal-dark-confirm',
          cancelButton: 'swal-dark-cancel'
        }
      });

      if (!result.isConfirmed) return;

      // Aggiungi tutti i prodotti (sequenziale per compatibilità con API)
      for (const product of wishlistItems) {
        await cartAPI.add(product.id, 1);
        emitCartAction('add', { id: product.id, name: product.name });
      }

      localStorage.setItem("wishlist", JSON.stringify([]));
      setWishlistItems([]);
      await loadCart();
      emitCartUpdate();
      window.dispatchEvent(new Event("wishlistUpdate"));

      // mostra feedback con spunta animata
      await Swal.fire({
        html: `
          <div class="swal-check-wrap">
            <div class="swal-check-icon" aria-hidden="true">✓</div>
            <div class="swal-check-label">Prodotti aggiunti al carretto</div>
          </div>
        `,
        timer: 1400,
        showConfirmButton: false,
        customClass: { popup: 'swal-dark-popup' },
        didOpen: (popup) => {
          const icon = popup.querySelector('.swal-check-icon');
          if (icon) setTimeout(() => icon.classList.add('animate'), 40);
        }
      });
    } catch (error) {
      toast.error("Errore durante l'aggiunta dei prodotti al carretto");
      logError('Errore moveAllToCart', error);
    }
  };

  const handleIncrease = async (productId) => {
    try {
      await cartAPI.increase(productId);
      await loadCart();
      emitCartUpdate();
      try {
        const name = cart.find(i => i.id === productId)?.name || 'Prodotto';
        emitCartAction('add', { id: productId, name });
      } catch (err) { void err; }
    } catch (error) {
      logError("Errore nell'aumentare la quantità", error);
      toast.error("Errore nell'aggiornamento del carretto");
    }
  };

  const handleDecrease = async (productId) => {
    try {
      const item = cart.find(i => i.id === productId);
      if (item && item.quantity > 1) {
        await cartAPI.decrease(productId);
        logAction(ACTIONS.CART_REMOVE, { id: productId });
      } else {
        await cartAPI.remove(productId);
        const name = item?.name || 'Prodotto';
        emitCartAction('remove', { id: productId, name });
      }
      await loadCart();
      emitCartUpdate();
    } catch (error) {
      logError("Errore nel diminuire la quantità", error);
      toast.error("Errore nell'aggiornamento del carretto");
    }
  };

  return (
    <>
      

      <div className="wishlist-page">
        <div className="wishlist-header">
          <div className="wishlist-header-content">
            <h1 className="wishlist-title">❤️ La Mia Wishlist</h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length === 0
                ? "La tua lista dei desideri è vuota"
                : `${wishlistItems.length} prodotti nella wishlist`}
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <div className="wishlist-header-buttons">
              <button className="btn-clear-wishlist" onClick={handleClearWishlist}>Svuota Wishlist</button>
              <button className="btn-move-all" onClick={handleMoveAllToCart}>Aggiungi tutto al carretto</button>
            </div>
          )}
        </div>
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">💔</div>
            <h2 className="wishlist-empty-title">La tua wishlist è vuota</h2>
            <p className="wishlist-empty-text">Inizia ad aggiungere i tuoi prodotti preferiti!</p>
            <button className="btn-shop-now" onClick={() => navigate("/shop")}>Scopri i Prodotti</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => (
              <div key={product.id} className="wishlist-item">
                <button className="wishlist-item-remove" onClick={() => handleRemoveFromWishlist(product)}>✕</button>
                <ProductCard
                  product={product}
                  variant="compact"
                  cart={cart}
                  onViewDetails={(slug) => handleViewDetails(slug)}
                  onAddToCart={() => handleAddToCart(product)}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                    onToggleWishlist={() => handleRemoveFromWishlist(product)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Wishlist;

