import "../styles/pages/Wishlist.css"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ProductCard from "../components/common/ProductCard"

function Wishlist() {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState([])
  const [notification, setNotification] = useState(null)

  //todo Funzione per caricare wishlist da localStorage
  const loadWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlistItems(wishlist)
  }

  //todo Carica wishlist da localStorage al mount
  useEffect(() => {
    loadWishlist()
    //todo Listener per sincronizzare wishlist tra tab
    window.addEventListener('storage', loadWishlist)
    window.addEventListener('wishlistUpdate', loadWishlist)
    
    return () => {
      window.removeEventListener('storage', loadWishlist)
      window.removeEventListener('wishlistUpdate', loadWishlist)
    }
  }, [])

  //todo Mostra notifica temporanea
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  //todo Naviga ai dettagli del prodotto
  const handleViewDetails = (slug) => {
    navigate(`/details/${slug}`)
  }

  //todo Rimuove prodotto dalla wishlist
  const handleRemoveFromWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const updatedWishlist = wishlist.filter(item => item.name !== product.name)
    
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist))
    setWishlistItems(updatedWishlist)
    
    //todo Trigger evento per sincronizzare altre pagine
    window.dispatchEvent(new Event('wishlistUpdate'))
    
    showNotification(`"${product.name}" rimosso dalla wishlist`)
  }

  //todo Aggiunge prodotto al carrello dalla wishlist
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.name === product.name)
    
    if (existingItem) {
      existingItem.quantity += 1
      showNotification(`Quantità di "${product.name}" aumentata nel carretto!`)
    } else {
      cart.push({ ...product, quantity: 1 })
      showNotification(`"${product.name}" aggiunto al carretto!`)
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdate'))
    window.dispatchEvent(new Event('storage'))
  }

  //todo Svuota tutta la wishlist
  const handleClearWishlist = () => {
    if (window.confirm('Vuoi davvero svuotare la wishlist?')) {
      localStorage.setItem('wishlist', JSON.stringify([]))
      setWishlistItems([])
      window.dispatchEvent(new Event('wishlistUpdate'))
      showNotification('Wishlist svuotata', 'success')
    }
  }

  //todo Calcola prezzo totale wishlist
  const totalWishlistValue = wishlistItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <>
      {/* todo: Notifica */}
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
        <div className="wishlist-header">
          <div className="wishlist-header-content">
            <h1 className="wishlist-title">
              ❤️ La Mia Wishlist
            </h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length === 0 
                ? 'La tua lista dei desideri è vuota'
                : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'prodotto' : 'prodotti'} nella tua wishlist`
              }
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="wishlist-header-actions">
              <div className="wishlist-total">
                <span className="wishlist-total-label">Valore totale:</span>
                <span className="wishlist-total-amount">{totalWishlistValue.toFixed(2)}€</span>
              </div>
              <button 
                className="btn-clear-wishlist"
                onClick={handleClearWishlist}
              >
                Svuota Wishlist
              </button>
            </div>
          )}
        </div>

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
                  title="Rimuovi dalla wishlist"
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
