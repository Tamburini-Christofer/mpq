// Wishlist.jsx
import "../styles/pages/Wishlist.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/common/ProductCard";
import { cartAPI, emitCartUpdate } from "../services/api";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notification, setNotification] = useState(null);
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
      console.error("Errore caricamento carrello:", error);
    }
  };

  useEffect(() => {
    loadWishlist();
    loadCart();
    window.addEventListener("storage", loadWishlist);
    window.addEventListener("wishlistUpdate", loadWishlist);
    window.addEventListener("cartUpdate", loadCart);

    return () => {
      window.removeEventListener("storage", loadWishlist);
      window.removeEventListener("wishlistUpdate", loadWishlist);
      window.removeEventListener("cartUpdate", loadCart);
    };
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleViewDetails = (slug) => {
    navigate(`/details/${slug}`);
  };

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.add(product.id, 1);
      await loadCart(); // aggiorna lo stato locale
      emitCartUpdate(); // notifica altri componenti
      showNotification(`"${product.name}" aggiunto al carrello!`);
    } catch (error) {
      showNotification("Errore nell'aggiunta al carrello", "error");
      console.error(error);
    }
  };

  const handleRemoveFromWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setWishlistItems(updatedWishlist);
    window.dispatchEvent(new Event("wishlistUpdate"));
    showNotification(`"${product.name}" rimosso dalla wishlist`);
  };

  const handleClearWishlist = () => {
    if (window.confirm("Vuoi davvero svuotare la wishlist?")) {
      localStorage.setItem("wishlist", JSON.stringify([]));
      setWishlistItems([]);
      window.dispatchEvent(new Event("wishlistUpdate"));
      showNotification("Wishlist svuotata");
    }
  };

  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    try {
      for (const product of wishlistItems) {
        await cartAPI.add(product.id, 1);
      }
      localStorage.setItem("wishlist", JSON.stringify([]));
      setWishlistItems([]);
      await loadCart();
      emitCartUpdate();
      window.dispatchEvent(new Event("wishlistUpdate"));
      showNotification("Tutti i prodotti sono stati aggiunti al carrello!");
    } catch (error) {
      showNotification("Errore durante l'aggiunta dei prodotti", "error");
      console.error(error);
    }
  };

  const handleIncrease = async (productId) => {
    try {
      await cartAPI.increase(productId);
      await loadCart();
      emitCartUpdate();
    } catch (error) {
      console.error("Errore nell'aumentare la quantità:", error);
      showNotification("Errore nell'aggiornamento del carrello", "error");
    }
  };

  const handleDecrease = async (productId) => {
    try {
      const item = cart.find(i => i.id === productId);
      if (item && item.quantity > 1) {
        await cartAPI.decrease(productId);
      } else {
        await cartAPI.remove(productId);
      }
      await loadCart();
      emitCartUpdate();
    } catch (error) {
      console.error("Errore nel diminuire la quantità:", error);
      showNotification("Errore nell'aggiornamento del carrello", "error");
    }
  };

  return (
    <>
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">{notification.type === "success" ? "✓" : "ℹ"}</span>
            <span className="notification-message">{notification.message}</span>
            <button className="notification-close" onClick={() => setNotification(null)}>✕</button>
          </div>
        </div>
      )}

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
              <button className="btn-move-all" onClick={handleMoveAllToCart}>Aggiungi tutto al carrello</button>
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

