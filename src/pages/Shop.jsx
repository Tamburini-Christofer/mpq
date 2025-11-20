//todo: Importiamo React e useState per creare componenti e gestire stati
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//todo: Importiamo il CSS del componente Shop per lo stile
import "../styles/pages/Shop.css"; 

//todo: Importiamo gli stili delle card
import "../styles/components/cardExp.css";

//todo: Importiamo il componente CheckoutForm
import CheckoutForm from "../components/shop/CheckoutForm";

//todo: Importiamo il componente ShopComponent per i filtri
import ShopComponent from "../components/shop/ShopComponent";

//todo: Importiamo SearchSortBar per la barra di ricerca
import SearchSortBar from "../components/shop/SearchSortBar";

//todo: Importiamo il componente FreeShippingBanner per la spedizione gratuita
import FreeShippingBanner from "../components/shop/FreeShippingBanner";

//todo: Creo il componente principale Shop
const Shop = () => {
  const navigate = useNavigate();
  
  //todo: Scroll istantaneo all'inizio della pagina quando si carica
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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

  //todo: Stato per i prodotti caricati dinamicamente dal backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //todo: useEffect per caricare i prodotti all'avvio del componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) {
          throw new Error('Errore nel caricamento prodotti');
        }
        const data = await response.json();
        
        //todo: Mappiamo i dati per aggiungere originalIndex e category
        const productsWithIndex = data.map((p, index) => ({
          ...p,
          originalIndex: index,
          category: p.category_id === 1 ? "film" : 
                    p.category_id === 2 ? "series" : 
                    p.category_id === 3 ? "anime" : "film"
        }));
        
        setProducts(productsWithIndex);
      } catch (err) {
        console.error('Errore fetch prodotti:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  //todo: Stato per i prodotti aggiunti al carrello (carica da localStorage se presente)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  //todo: Sincronizza il carrello con localStorage ogni volta che cambia
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  //todo: Ascolta i cambiamenti del localStorage da altre pagine (es. Details)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  //todo: Stato per gestire le notifiche popup (es. "Prodotto aggiunto!")
  const [notification, setNotification] = useState(null);

  //todo: Stato per memorizzare il codice promozionale inserito dall'utente
  const [promoCode, setPromoCode] = useState('');
  //todo: Stato booleano che indica se il codice promozionale è stato applicato con successo
  const [promoApplied, setPromoApplied] = useState(false);
  //todo: Stato per il messaggio di feedback (successo/errore) del codice promozionale
  const [promoMessage, setPromoMessage] = useState('');

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
    //todo: Controllo se il prodotto era già nel carrello (confronto per nome)
    const wasInCart = cart.find(item => item.name === product.name);
    
    //todo: Calcoliamo il prezzo finale considerando eventuali sconti
    const finalPrice = calculateFinalPrice(product);
    
    setCart((prev) => {
      //todo: Trovo se esiste già l'item nel carrello
      const existingItem = prev.find(item => item.name === product.name);
      
      if (existingItem) {
        //todo: Se esiste, incremento la quantità di 1
        return prev.map(item =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        //todo: Se non esiste, lo aggiungo con il prezzo finale (scontato se applicabile) e quantità iniziale 1
        return [...prev, { ...product, price: finalPrice, quantity: 1 }];
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
  const removeFromCart = (productName) => {
    //todo: Trovo il prodotto da rimuovere per mostrare il nome nella notifica
    const productToRemove = cart.find(item => item.name === productName);
    
    setCart((prev) => prev.filter((item) => item.name !== productName));
    
    //todo: Mostro notifica di rimozione in rosso
    if (productToRemove) {
      showNotification(`"${productToRemove.name}" rimosso dal carretto!`, 'error');
    }
  };

  //todo: Funzione per diminuire la quantità di un prodotto nel carrello
  const decreaseQuantity = (productName) => {
    //todo: Trovo il prodotto per controllare se sarà rimosso
    const productToCheck = cart.find(item => item.name === productName);
    const willBeRemoved = productToCheck && productToCheck.quantity === 1;
    
    setCart((prev) => {
      return prev.map(item => {
        if (item.name === productName) {
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
  const increaseQuantity = (productName) => {
    setCart((prev) => 
      prev.map(item =>
        item.name === productName
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  //todo: Funzione helper per calcolare il prezzo finale considerando lo sconto
  const calculateFinalPrice = (product) => {
    //todo: Se il prodotto ha uno sconto (valore numerico > 0), calcoliamo il prezzo scontato
    if (product.discount && typeof product.discount === 'number' && product.discount > 0) {
      //todo: Formula: prezzo originale * (1 - sconto/100)
      //todo: Es: 10€ con sconto 20% = 10 * (1 - 20/100) = 10 * 0.8 = 8€
      return product.price * (1 - product.discount / 100);
    }
    //todo: Se non c'è sconto, restituiamo il prezzo originale
    return product.price;
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

    // Filtro per prezzo (considerando prezzo finale scontato)
    if (filters.priceRange) {
      filtered = filtered.filter(p => {
        const finalPrice = calculateFinalPrice(p);
        return finalPrice <= filters.priceRange.current;
      });
    }

    // Filtro per categorie
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => 
        filters.categories.includes(p.category)
      );
    }

    // Filtro per prodotti in promozione
    if (filters.onSale) {
      filtered = filtered.filter(p => 
        p.discount && typeof p.discount === 'number' && p.discount > 0
      );
    }

    // Ordinamento
    switch(sortValue) {
      case 'discount-desc':
        //todo: Ordinamento per sconto decrescente (maggiore sconto prima)
        filtered.sort((a, b) => {
          const aDiscount = (a.discount && typeof a.discount === 'number') ? a.discount : 0;
          const bDiscount = (b.discount && typeof b.discount === 'number') ? b.discount : 0;
          return bDiscount - aDiscount;
        });
        break;
      case 'price-asc':
        //todo: Ordinamento per prezzo crescente (considerando prezzo finale scontato)
        filtered.sort((a, b) => calculateFinalPrice(a) - calculateFinalPrice(b));
        break;
      case 'price-desc':
        //todo: Ordinamento per prezzo decrescente (considerando prezzo finale scontato)
        filtered.sort((a, b) => calculateFinalPrice(b) - calculateFinalPrice(a));
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

  //todo: Funzione per validare e applicare il codice promozionale inserito dall'utente
  const applyPromoCode = () => {
    //todo: Confrontiamo il codice inserito con 'WELCOMEQUEST' (case-insensitive)
    if (promoCode.trim().toUpperCase() === 'WELCOMEQUEST') {
      //todo: Verifichiamo che il codice non sia già stato applicato in precedenza
      if (!promoApplied) {
        //todo: Settiamo promoApplied a true per indicare che il codice è valido e attivo
        setPromoApplied(true);
        //todo: Mostriamo messaggio di successo con icona check (✓)
        setPromoMessage('✓ Codice promozionale applicato! Spese di spedizione gratuite.');
        //todo: Mostriamo notifica popup verde per confermare l'applicazione
        showNotification('Codice promozionale applicato con successo!', 'success');
      } else {
        //todo: Se il codice è già stato applicato, mostriamo un avviso con icona warning (⚠)
        setPromoMessage('⚠ Codice già applicato.');
      }
    } else {
      //todo: Se il codice non corrisponde, mostriamo errore con icona X (✗)
      setPromoMessage('✗ Codice promozionale non valido.');
      //todo: Resettiamo promoApplied a false in caso di codice errato
      setPromoApplied(false);
    }
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
            {/* todo: Gestione stati di caricamento e errore */}
            {loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '50px 20px',
                fontSize: '18px',
                color: 'var(--primary-color)'
              }}>
                <div style={{ marginBottom: '15px' }}>🔄</div>
                Caricamento prodotti...
              </div>
            )}

            {error && (
              <div style={{ 
                textAlign: 'center', 
                padding: '50px 20px',
                fontSize: '18px',
                color: '#e74c3c',
                backgroundColor: '#ffebee',
                borderRadius: '8px',
                margin: '20px 0'
              }}>
                <div style={{ marginBottom: '15px' }}>⚠️</div>
                Errore: {error}
                <div style={{ marginTop: '15px' }}>
                  <button 
                    onClick={() => window.location.reload()} 
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Riprova
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
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
              {getFilteredAndSortedProducts().slice(0, visibleProducts).map((p) => {
                //todo: Calcoliamo il prezzo finale e verifichiamo se c'è uno sconto attivo
                const finalPrice = calculateFinalPrice(p);
                const hasDiscount = p.discount && typeof p.discount === 'number' && p.discount > 0;
                
                return (
                  <div key={p.name} className="card fancy-card">
                    {/*todo: Badge OFFERTA se il prodotto ha uno sconto*/}
                    {hasDiscount && (
                      <span className="card-badge card-badge--sale">
                        -{p.discount}%
                      </span>
                    )}
                    
                    <div className="card-image-wrapper">
                      <img src={p.image} alt={p.name} className="card-image" />
                    </div>

                    <div className="card-body">
                      <h3>{p.name}</h3>
                      {/*todo: Se c'è sconto, mostriamo prezzo scontato principale + prezzo originale barrato sotto*/}
                      {hasDiscount ? (
                        <div className="price-container">
                          <span className="price price--discount">{finalPrice.toFixed(2)}€</span>
                          <span 
                            className="price price--original"
                            data-original-price="true"
                          >
                            {p.price.toFixed(2)}€
                          </span>
                        </div>
                      ) : (
                        <p className="price">{p.price.toFixed(2)}€</p>
                      )}
                      {viewMode === "list" && (
                        <div className="card-details">
                          <p className="detail-item"><span className="detail-label">Categoria:</span> Videogames</p>
                        </div>
                      )}
                    </div>

                    <div className="card-actions">
                      {/*todo Navigazione alla pagina dettaglio usando originalIndex*/}
                      <button className="details-btn" onClick={() => navigate(`/exp/${p.originalIndex}`)}>
                        Dettagli
                      </button>
                      <button className="buy-btn" onClick={() => addToCart(p)}>
                        {viewMode === "list" ? "Aggiungi al Carretto" : "Aggiungi"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pulsante per caricare altri prodotti */}
            {visibleProducts < getFilteredAndSortedProducts().length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={loadMoreProducts}>
                  Carica altri 10 prodotti ({getFilteredAndSortedProducts().length - visibleProducts} rimanenti)
                </button>
              </div>
            )}
            
            </>
            )}

          </div>
        )}

        {/* todo: Sezione Carrello */}
        {activeTab === "cart" && (
          <div className="cart-section">
            <h2 className="section-title">Carretto</h2>

            {/* todo: Banner spedizione gratuita */}
            {cart.length > 0 && (
              <FreeShippingBanner 
                subtotal={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                threshold={40}
                promoApplied={promoApplied}
              />
            )}

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
                        onClick={() => decreaseQuantity(item.name)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => increaseQuantity(item.name)}
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
                        onClick={() => removeFromCart(item.name)}
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
                          onClick={() => removeFromCart(item.name)}
                          title="Rimuovi dal carretto"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* todo: Sezione per inserire il codice promozionale */}
                <div className="promo-code-section">
                  <h3 className="checkout-subtitle">Codice Promozionale:</h3>
                  <div className="promo-code-input-group">
                    {/*todo: Input di testo per inserire il codice promo (es: WELCOMEQUEST)*/}
                    <input
                      type="text"
                      className="promo-code-input"
                      placeholder="Inserisci codice (es: WELCOMEQUEST)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    {/*todo: Bottone per applicare il codice, disabilitato se già applicato*/}
                    <button
                      className="promo-code-btn"
                      onClick={applyPromoCode}
                      disabled={promoApplied}
                    >
                      {/*todo: Cambia testo del bottone: "Applicato" se attivo, "Applica" se disponibile*/}
                      {promoApplied ? 'Applicato' : 'Applica'}
                    </button>
                  </div>
                  {/*todo: Mostra messaggio di feedback solo se presente (successo in verde, errore in rosso)*/}
                  {promoMessage && (
                    <p className={`promo-message ${promoApplied ? 'success' : 'error'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* todo: Totale ordine e bottoni azioni */}
                <div className="checkout-summary">
                  {/*todo: Calcoliamo i valori fuori dalla IIFE per usarli anche nelle azioni*/}
                  {(() => {
                    //todo: Calcoliamo il subtotale sommando prezzo × quantità di ogni prodotto
                    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    //todo: Spese spedizione: 0€ se sopra 40€ O se promo applicata, altrimenti 4.99€
                    const isFreeShipping = subtotal >= 40 || promoApplied;
                    const shippingCost = isFreeShipping ? 0 : 4.99;
                    //todo: Totale finale = subtotale + spese di spedizione
                    const total = subtotal + shippingCost;
                    
                    return (
                      <>
                        <div className="checkout-total">
                          {/*todo: Riga che mostra il subtotale (solo prodotti, senza spedizione)*/}
                          <div className="checkout-subtotal">
                            <span>Subtotale:</span>
                            <span>{subtotal.toFixed(2)}€</span>
                          </div>
                          {/*todo: Riga spese di spedizione con logica promo e soglia 40€*/}
                          <div className="checkout-shipping">
                            <span>Spese di spedizione:</span>
                            <span className={isFreeShipping ? 'free-shipping' : ''}>
                              {/*todo: Se spedizione gratuita (sopra 40€ o promo), mostra prezzo barrato + "GRATIS" in verde*/}
                              {isFreeShipping ? (
                                <>
                                  <span style={{textDecoration: 'line-through', color: '#999'}}>4.99€</span>
                                  {' '}
                                  <span style={{color: '#4ade80'}}>GRATIS</span>
                                </>
                              ) : (
                                //todo: Altrimenti mostra il costo normale 4.99€
                                '4.99€'
                              )}
                            </span>
                          </div>
                          {/*todo: Riga totale finale con bordo superiore per evidenziare*/}
                          <div className="checkout-total-final">
                            <h3>Totale Ordine:</h3>
                            <h3>{total.toFixed(2)}€</h3>
                          </div>
                        </div>
                        
                        {/* todo: Banner spedizione gratuita */}
                        <FreeShippingBanner 
                          subtotal={subtotal}
                          threshold={40}
                          promoApplied={promoApplied}
                        />
                        
                        <div className="checkout-actions">
                          {/*todo: Mostriamo l'icona FreeShipping se sopra 40€ o se il codice promo è stato applicato*/}
                          {isFreeShipping && (
                            <img 
                              src="/icon/FreeShipping.png" 
                              alt="Spedizione Gratuita" 
                              className="free-shipping-icon"
                              title="Spedizione gratuita attiva!"
                            />
                          )}
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
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      
      {/* todo: Overlay form checkout */}
      {/* todo: Passiamo 4 props al CheckoutForm: totalAmount (con spedizione), cartItems, shippingCost e isFreeShipping */}
      {showCheckoutForm && (() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const isFreeShipping = subtotal >= 40 || promoApplied;
        const shippingCost = isFreeShipping ? 0 : 4.99;
        const totalAmount = subtotal + shippingCost;
        
        return (
          <CheckoutForm
            /* todo: Funzione callback per chiudere l'overlay quando l'utente clicca su X o annulla */
            onClose={() => setShowCheckoutForm(false)}
            /* todo: Totale calcolato con logica spedizione gratuita */
            totalAmount={totalAmount}
            /* todo: Passiamo intero carrello per mostrare dettagli prodotti nel riepilogo */
            cartItems={cart}
            /* todo: Costo spedizione: 0 se sopra 40€ o promo, 4.99 altrimenti */
            shippingCost={shippingCost}
            /* todo: Stato booleano per mostrare "GRATIS" barrato nel form */
            isFreeShipping={isFreeShipping}
          />
        );
      })()}
    </div>
  );
};

//todo: Esporto il componente Shop così può essere usato in altre parti dell'app
export default Shop;
