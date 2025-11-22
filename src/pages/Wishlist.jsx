import "../styles/pages/Wishlist.css"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ProductCard from "../components/common/ProductCard"
import { cartAPI, emitCartUpdate } from "../services/api"

function Wishlist() {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [notification, setNotification] = useState(null)

  // Carica wishlist
  const loadWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlistItems(wishlist)
  }

  useEffect(() => {
    loadWishlist()
    window.addEventListener('storage', loadWishlist)
    window.addEventListener('wishlistUpdate', loadWishlist)
    
    return () => {
      window.removeEventListener('storage', loadWishlist)
      window.removeEventListener('wishlistUpdate', loadWishlist)
    }
  }, [])

  // Notifiche
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Navigazione ai dettagli del prodotto
  const handleViewDetails = (slug) => {
    navigate(`/details/${slug}`)
  }

  // Rimuovi singolo dalla wishlist
  const handleRemoveFromWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const updatedWishlist = wishlist.filter(item => item.id !== product.id)
    
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    setWishlistItems(updatedWishlist)

    window.dispatchEvent(new Event('wishlistUpdate'))
    
    showNotification(`"${product.name}" rimosso dalla wishlist`)
  }

  // Aggiunge singolo al carretto tramite API
  const handleAddToCart = async (product) => {
    try {
      await cartAPI.add(product.id, 1)
      emitCartUpdate()
      showNotification(`"${product.name}" aggiunto al carretto!`)
    } catch (error) {
      showNotification("Errore nell'aggiunta al carretto", "error")
      console.error(error)
    }
  }

  // Svuota wishlist
  const handleClearWishlist = () => {
    if (window.confirm('Vuoi davvero svuotare la wishlist?')) {
      localStorage.setItem('wishlist', JSON.stringify([]))
      setWishlistItems([])
      window.dispatchEvent(new Event('wishlistUpdate'))
      showNotification('Wishlist svuotata')
    }
  }

  // 👉 Aggiungi TUTTA la wishlist al carretto tramite API
  const handleMoveAllToCart = async () => {
    if (wishlistItems.length === 0) return

    try {
      for (const product of wishlistItems) {
        await cartAPI.add(product.id, 1)
      }

      // svuota wishlist
      localStorage.setItem('wishlist', JSON.stringify([]))
      setWishlistItems([])

      emitCartUpdate()
      window.dispatchEvent(new Event('wishlistUpdate'))

      showNotification("Tutti i prodotti sono stati aggiunti al carretto!")

    } catch (error) {
      console.error("Errore aggiunta multipla:", error)
      showNotification("Errore durante l'aggiunta dei prodotti", "error")
    }
  }

  // Totale
  const totalWishlistValue = wishlistItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
    return sum + (price || 0)
  }, 0)

  return (
    <>
      {/* Notifica */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="wishlist-page">
        
        {/* HEADER */}
        <div className="wishlist-header">
          <div className="wishlist-header-content">
            <h1 className="wishlist-title">❤️ La Mia Wishlist</h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length === 0 
                ? 'La tua lista dei desideri è vuota'
                : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'prodotto' : 'prodotti'} nella tua wishlist`
              }
            </p>
          </div>

          {/* BOTTONI HEADER */}
          {wishlistItems.length > 0 && (
            <div className="wishlist-header-buttons">
              
              <button 
                className="btn-clear-wishlist"
                onClick={handleClearWishlist}
              >
                Svuota Wishlist
              </button>

              <button 
                className="btn-move-all"
                onClick={handleMoveAllToCart}
              >
                Aggiungi tutto al Carretto
              </button>

            </div>
          )}
        </div>

        {/* LISTA WISHLIST */}
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">💔</div>
            <h2 className="wishlist-empty-title">La tua wishlist è vuota</h2>
            <p className="wishlist-empty-text">
              Inizia ad aggiungere i tuoi prodotti preferiti alla wishlist!
            </p>
            <button 
              className="btn-shop-now"
              onClick={() => navigate('/shop')}
            >
              Scopri i Prodotti
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product, index) => (
              <div key={index} className="wishlist-item">
                
                <button 
                  className="wishlist-item-remove"
                  onClick={() => handleRemoveFromWishlist(product)}
                >
                  ✕
                </button>

                <ProductCard
                  product={product}
                  variant="grid"
                  onViewDetails={(slug) => handleViewDetails(slug)}
                  onAddToCart={() => handleAddToCart(product)}
                />

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}

export default Wishlist
