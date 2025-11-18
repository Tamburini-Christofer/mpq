//todo: Importiamo React e useState per creare componenti e gestire stati
import React, { useState } from "react";

//todo: Importiamo il CSS del componente Shop per lo stile
import "./Shop.css"; 

//todo: Importiamo il componente CheckoutForm
import CheckoutForm from "../components/CheckoutForm";

//todo: Importiamo il componente ShopComponent per i filtri
import ShopComponent from "../components/ShopComponent";

//todo: Importiamo SearchSortBar per la barra di ricerca
import SearchSortBar from "../components/SearchSortBar";

//todo: Creo il componente principale Shop
const Shop = () => {
  //todo: Stato per sapere quale tab è attivo (Shop, Carrello o Checkout)
  const [activeTab, setActiveTab] = useState("shop");
  
  //todo: Stato per la modalità di visualizzazione (grid o list)
  const [viewMode, setViewMode] = useState("grid");
  
  //todo: Stato per mostrare/nascondere il form di checkout
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  
  //todo: Stato per mostrare/nascondere i filtri
  const [showFilters, setShowFilters] = useState(false);
  
  //todo: Stato per la ricerca
  const [searchValue, setSearchValue] = useState('');
  
  //todo: Stato per l'ordinamento
  const [sortValue, setSortValue] = useState('recent');
  
  //todo: Stato per i filtri
  const [filters, setFilters] = useState({
    priceRange: { 
      min: 0,
      max: 100,
      current: 100
    },
    categories: [],
    difficulties: []
  });
  
  //todo: Stato per gestire il numero di prodotti visibili (inizia con 10)
  const [visibleProducts, setVisibleProducts] = useState(10);

  //todo: Lista di prodotti disponibili nello shop (sono degli esempi)
    const products = [
    { id: 1, name: "The Lord Of the Ring", price: 4.99, category: "film", image:"https://i.pinimg.com/736x/cc/46/97/cc46970d2822df62d24b1bddcc7a954e.jpg" },
    { id: 2, name: "Stranger Things", price: 9.99, category: "series", image: "https://i.pinimg.com/736x/f2/be/e8/f2bee8d0313d774c36522a88eec3a5ac.jpg" },
    { id: 3, name: "Harry Potter Collection", price: 69.99, category: "film", image: "https://art.pixilart.com/c54917a56a375fc.gif" },
    { id: 4, name: "Anime Collection", price: 69.99, category: "anime", image: "https://play-lh.googleusercontent.com/Rv9O8Xg6o5wFMcDkLBoxCDOxqGPYGh5pzQyKSKvemuxiGOlyWZrOWt2vqqkOe52TvRWN"},
    { id: 5, name: "Football", price: 19.99, category: "film", image: "https://i.pinimg.com/736x/0e/69/59/0e695915a40ac1006e88836f9b0cd189.jpg"},
    { id: 6, name: "Gigina la dinosaura", price: 19.99, category: "film", image: "https://ih1.redbubble.net/image.4923453391.3760/flat,750x,075,f-pad,750x1000,f8f8f8.jpg"},
    { id: 7, name: "Samir Experience", price: 29.99, category: "anime", image: "https://previews.123rf.com/images/virtosmedia/virtosmedia2302/virtosmedia230286068/199315765-pixel-art-illustration-of-an-indian-warrior-with-a-sword-in-his-hand.jpg"},
    { id: 8, name: "El Trentin", price: 39.99, category: "series", image: "https://i.pinimg.com/736x/1e/d5/22/1ed522c84c8285e88acb9cc26d86997a.jpg"},
    { id: 9, name: "The Lord Of the Ring", price: 4.99, category: "film", image:"https://i.pinimg.com/736x/cc/46/97/cc46970d2822df62d24b1bddcc7a954e.jpg" },
    { id: 10, name: "Stranger Things", price: 9.99, category: "series", image: "https://i.pinimg.com/736x/f2/be/e8/f2bee8d0313d774c36522a88eec3a5ac.jpg" },
    { id: 11, name: "Harry Potter Collection", price: 69.99, category: "film", image: "https://art.pixilart.com/c54917a56a375fc.gif" },
    { id: 12, name: "Anime Collection", price: 69.99, category: "anime", image: "https://play-lh.googleusercontent.com/Rv9O8Xg6o5wFMcDkLBoxCDOxqGPYGh5pzQyKSKvemuxiGOlyWZrOWt2vqqkOe52TvRWN"},
    { id: 13, name: "Football", price: 19.99, category: "film", image: "https://i.pinimg.com/736x/0e/69/59/0e695915a40ac1006e88836f9b0cd189.jpg"},
    { id: 14, name: "Gigina la dinosaura", price: 19.99, category: "film", image: "https://ih1.redbubble.net/image.4923453391.3760/flat,750x,075,f-pad,750x1000,f8f8f8.jpg"},
    { id: 15, name: "Samir Experience", price: 29.99, category: "anime", image: "https://previews.123rf.com/images/virtosmedia/virtosmedia2302/virtosmedia230286068/199315765-pixel-art-illustration-of-an-indian-warrior-with-a-sword-in-his-hand.jpg"},
    { id: 16, name: "El Trentin", price: 39.99, category: "series", image: "https://i.pinimg.com/736x/1e/d5/22/1ed522c84c8285e88acb9cc26d86997a.jpg"},
  ];

  //todo: Stato per i prodotti aggiunti al carrello
  const [cart, setCart] = useState([]);

  //todo: Stato per gestire le notifiche popup (es. "Prodotto aggiunto!")
  const [notification, setNotification] = useState(null);

  //todo: Funzione per mostrare una notifica
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    //todo: La notifica scompare automaticamente dopo 3 secondi
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  //todo: Funzione per aggiungere un prodotto al carrello
  const addToCart = (product) => {
    //todo: Controllo se il prodotto era già nel carrello
    const wasInCart = cart.find(item => item.id === product.id);
    
    setCart((prev) => {
      //todo: Trovo se esiste già l'item nel carrello
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        //todo: Se esiste, incremento la quantità di 1
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        //todo: Se non esiste, lo aggiungo con quantità iniziale 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    //todo: Mostro una notifica diversa a seconda se era già nel carrello
    if (wasInCart) {
      showNotification(`Quantità di "${product.name}" aumentata nel carretto!`);
    } else {
      showNotification(`"${product.name}" aggiunto al carretto!`);
    }
  };

  //todo: Funzione per rimuovere completamente un prodotto dal carrello
  const removeFromCart = (id) => {
    //todo: Trovo il prodotto da rimuovere per mostrare il nome nella notifica
    const productToRemove = cart.find(item => item.id === id);
    
    setCart((prev) => prev.filter((item) => item.id !== id));
    
    //todo: Mostro notifica di rimozione in rosso
    if (productToRemove) {
      showNotification(`"${productToRemove.name}" rimosso dal carretto!`, 'error');
    }
  };

  //todo: Funzione per diminuire la quantità di un prodotto nel carrello
  const decreaseQuantity = (id) => {
    //todo: Trovo il prodotto per controllare se sarà rimosso
    const productToCheck = cart.find(item => item.id === id);
    const willBeRemoved = productToCheck && productToCheck.quantity === 1;
    
    setCart((prev) => {
      return prev.map(item => {
        if (item.id === id) {
          if (item.quantity === 1) {
            //todo: Se la quantità è 1, rimuovo il prodotto dal carrello
            return null;
          }
          //todo: Altrimenti diminuisco la quantità di 1
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(Boolean); //todo: Rimuovo eventuali elementi null
    });
    
    //todo: Mostro notifica se il prodotto è stato completamente rimosso
    if (willBeRemoved && productToCheck) {
      showNotification(`"${productToCheck.name}" rimosso dal carretto!`, 'error');
    }
  };

  //todo: Funzione per aumentare la quantità di un prodotto nel carrello
  const increaseQuantity = (id) => {
    setCart((prev) => 
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  //todo: Funzione per filtrare e ordinare prodotti
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Filtro per ricerca
    if (searchValue) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filtro per prezzo
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price <= filters.priceRange.current
      );
    }

    // Filtro per categorie
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => 
        filters.categories.includes(p.category)
      );
    }

    // Ordinamento
    switch(sortValue) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // 'recent' - mantieni ordine originale
        break;
    }

    return filtered;
  };

  //todo: Funzione per caricare altri 10 prodotti
  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 10);
  };

  //todo: Inizio del render del componente
  return (
    <div className="shop-ui-container">
      {/* todo: Mostro la notifica se esiste */}
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

      {/* todo: Sidebar laterale con logo e menu */}
      <aside className={`sidebar ${showFilters ? 'collapsed' : ''}`}>
        <div className="logo-box">
          <div className="icon"></div>
          <h1 className="title">MyPocket<span>Quest</span></h1>
          <p className="subtitle">Next Level: Real Life</p>
        </div>

        {/* todo: Menu dei tab per navigare tra Shop, Carrello e Checkout */}
        <div className="menu">
          <button
            className={activeTab === "shop" ? "menu-btn active" : "menu-btn"}
            onClick={() => setActiveTab("shop")}
          >
            Shop
          </button>

          <button
            className={activeTab === "cart" ? "menu-btn active" : "menu-btn"}
            onClick={() => setActiveTab("cart")}
          >
            Carretto ({cart.length})
          </button>

          <button
            className={
              activeTab === "checkout" ? "menu-btn active" : "menu-btn"
            }
            onClick={() => setActiveTab("checkout")}
          >
            Checkout
          </button>
        </div>
      </aside>

      {/* todo: Pannello filtri */}
      {showFilters && (
        <div className="filters-panel">
          <ShopComponent 
            products={products}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      )}

      {/* todo: Contenuto principale */}
      <main className="content">
        {/* todo: Sezione Shop */}
        {activeTab === "shop" && (
          <div className="shop-section">
            {/* todo: Controlli per cambiare visualizzazione */}
            <div className="view-controls">
              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  className={viewMode === "grid" ? "view-btn active" : "view-btn"}
                  onClick={() => setViewMode("grid")}
                  title="Visualizzazione a griglia"
                >
                  <span className="view-icon">⊞</span>
                </button>
                <button 
                  className={viewMode === "list" ? "view-btn active" : "view-btn"}
                  onClick={() => setViewMode("list")}
                  title="Visualizzazione a lista"
                >
                  <span className="view-icon">☰</span> 
                </button>
                <button 
                  className={showFilters ? "view-btn active" : "view-btn"}
                  onClick={() => setShowFilters(!showFilters)}
                  title="Mostra/Nascondi Filtri"
                >
                  <span className="view-icon">⚙</span> Filtri
                </button>
              </div>

              {/* todo: Barra di ricerca e ordinamento */}
              <SearchSortBar 
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                sortValue={sortValue}
                onSortChange={setSortValue}
              />
            </div>

            <div className={`products ${viewMode}`}>
              {getFilteredAndSortedProducts().slice(0, visibleProducts).map((p) => (
                <div key={p.id} className="card fancy-card">
                  
                  <div className="card-image-wrapper">
                    <img src={p.image} alt={p.name} className="card-image" />
                  </div>

                  <div className="card-body">
                    <h3>{p.name}</h3>
                    <p className="price">{p.price.toFixed(2)}€</p>
                    {viewMode === "list" && (
                      <div className="card-details">
                        <p className="detail-item"><span className="detail-label">Categoria:</span> Videogames</p>
                      </div>
                    )}
                  </div>

                  <button className="buy-btn" onClick={() => addToCart(p)}>
                    {viewMode === "list" ? "Aggiungi al Carretto" : "Aggiungi"}
                  </button>
                </div>
              ))}
            </div>

            {/* Pulsante per caricare altri prodotti */}
            {visibleProducts < getFilteredAndSortedProducts().length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={loadMoreProducts}>
                  Carica altri 10 prodotti ({getFilteredAndSortedProducts().length - visibleProducts} rimanenti)
                </button>
              </div>
            )}

          </div>
        )}

        {/* todo: Sezione Carrello */}
        {activeTab === "cart" && (
          <div className="cart-section">
            <h2 className="section-title">Carretto</h2>

            {cart.length === 0 ? (
              //todo: Messaggio se il carrello è vuoto
              <div className="empty-cart">
                <p>Il carretto è vuoto.</p>
                <p>Vai al Shop per aggiungere prodotti!</p>
                <img src="/public/icon/EmptyShop.png" alt="Il logo del carrello vuoto" />
              </div>
            ) : (
              //todo: Lista prodotti nel carrello
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">{item.price.toFixed(2)}€</span>
                    </div>
                    
                    {/* todo: Controlli per cambiare la quantità */}
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>

                    {/* todo: Mostra totale per prodotto e bottone per rimuovere */}
                    <div className="item-total">
                      <span className="total-price">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* todo: Mostro totale del carrello */}
                <div className="cart-total">
                  <strong>
                    Totale Carretto: {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* todo: Sezione Checkout */}
        {activeTab === "checkout" && (
          <div className="checkout-section">
            <h2 className="section-title">Checkout</h2>
            
            {cart.length === 0 ? (
              //todo: Messaggio se il carrello è vuoto
              <div className="empty-checkout">
                <p>Il carretto è vuoto.</p>
                <p>Aggiungi prodotti al carretto per procedere al checkout.</p>
                <img src="/public/icon/InShop.png" alt="Il logo del carrello vuoto" />
              </div>
            ) : (
              <>
                {/* todo: Riepilogo prodotti nel checkout */}
                <div className="checkout-items">
                  <h3 className="checkout-subtitle">Riepilogo Ordine:</h3>
                  
                  {cart.map((item) => (
                    <div key={item.id} className="checkout-item">
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{item.name}</span>
                        <span className="checkout-item-details">
                          {item.quantity} x {item.price.toFixed(2)}€
                        </span>
                      </div>
                      
                      <div className="checkout-item-actions">
                        <span className="checkout-item-total">
                          {(item.price * item.quantity).toFixed(2)}€
                        </span>
                        <button
                          className="checkout-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Rimuovi dal carretto"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* todo: Totale ordine e bottoni azioni */}
                <div className="checkout-summary">
                  <div className="checkout-total">
                    <h3>
                      Totale Ordine: {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€
                    </h3>
                  </div>
                  
                  <div className="checkout-actions">
                    <button 
                      className="clear-cart-btn"
                      onClick={() => {
                        const itemCount = cart.length;
                        setCart([]);
                        showNotification(`Carretto svuotato! ${itemCount} prodotti rimossi.`, 'error');
                      }}
                    >
                      Svuota Carretto
                    </button>
                    <button 
                      className="confirm-btn"
                      onClick={() => setShowCheckoutForm(true)}
                    >
                      Conferma Acquisto e parti per la tua prossima avventura
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      
      {/* todo: Overlay form checkout */}
      {showCheckoutForm && (
        <CheckoutForm
          onClose={() => setShowCheckoutForm(false)}
          totalAmount={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
          cartItems={cart}
        />
      )}
    </div>
  );
};

//todo: Esporto il componente Shop così può essere usato in altre parti dell'app
export default Shop;
