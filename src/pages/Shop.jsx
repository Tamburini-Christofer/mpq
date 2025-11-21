//todo: Importiamo React e useState per creare componenti e gestire stati
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//todo: Importiamo il CSS del componente Shop per lo stile
import "../styles/pages/Shop.css";

//todo: Importiamo gli stili delle card
import "../styles/components/cardExp.css";

//todo: Importiamo le API per gestire prodotti e carrello
import { productsAPI, cartAPI, emitCartUpdate } from "../services/api";

//todo: Importiamo il componente ProductCard
import ProductCard from "../components/common/ProductCard";

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
    matureContent: false,
    onSale: false
  });

  //todo: Stato per gestire il numero di prodotti visibili (inizia con 10)
  const [visibleProducts, setVisibleProducts] = useState(10);
  //todo: Stato per i prodotti caricati dal backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  //todo: Carica prodotti dal backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAll();
        const mappedProducts = data.map((p, index) => ({
          ...p,
          originalIndex: index,
          category: p.category_id === 1 ? "film" :
            p.category_id === 2 ? "series" :
              p.category_id === 3 ? "anime" : "film"
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Errore caricamento prodotti:', error);
        showNotification('Errore nel caricamento dei prodotti', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  //todo: Stato per i prodotti nel carrello (caricati dal backend)
  const [cart, setCart] = useState([]);

  //todo: Carica carrello dal backend
  const loadCart = async () => {
    try {
      const cartData = await cartAPI.get();
      setCart(cartData);
      emitCartUpdate();
    } catch (error) {
      console.error('Errore caricamento carrello:', error);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  //todo: Ascolta aggiornamenti carrello da altre componenti
  useEffect(() => {
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdate', handleCartUpdate);
    return () => window.removeEventListener('cartUpdate', handleCartUpdate);
  }, []);

  //todo: Stato per memorizzare il codice promozionale inserito dall'utente
  const [promoCode, setPromoCode] = useState('');
  //todo: Stato booleano che indica se il codice promozionale è stato applicato con successo
  const [promoApplied, setPromoApplied] = useState(false);
  //todo: Stato per il messaggio di feedback (successo/errore) del codice promozionale
  const [promoMessage, setPromoMessage] = useState('');

  //todo: Funzione per aggiungere un prodotto al carrello
  const addToCart = async (product) => {
    try {
      //todo: Controllo se il prodotto era già nel carrello
      const wasInCart = cart.find(item => item.id === product.id);

      //todo: Chiama API per aggiungere al carrello
      await cartAPI.add(product.id, 1);

      //todo: Ricarica carrello dal backend
      await loadCart();

      //todo: Mostro notifica
      if (wasInCart) {
        showNotification(`Quantità di "${product.name}" aumentata nel carretto!`);
      } else {
        showNotification(`"${product.name}" aggiunto al carretto!`);
      }
    } catch (error) {
      showNotification('Errore nell\'aggiunta al carrello', 'error');
    }
  };

  //todo: Funzione per rimuovere completamente un prodotto dal carrello
  const removeFromCart = async (productId) => {
    try {
      console.log('🗑️ Rimozione prodotto:', { productId, cart });
      //todo: Trova prodotto per notifica
      const productToRemove = cart.find(item => {
        console.log('🔍 Confronto:', { itemId: item.id, itemName: item.name, productId });
        return item.id === productId || item.name === productId;
      });

      console.log('📦 Prodotto trovato:', productToRemove);

      //todo: Chiama API per rimuovere (usa l'ID corretto)
      const idToRemove = productToRemove ? productToRemove.id : productId;
      await cartAPI.remove(idToRemove);

      //todo: Ricarica carrello
      await loadCart();

      if (productToRemove) {
        showNotification(`"${productToRemove.name}" rimosso dal carretto!`, 'error');
      } else {
        showNotification('Prodotto rimosso dal carrello', 'error');
      }
    } catch (error) {
      showNotification('Errore nella rimozione', 'error');
    }
  };

  //todo: Funzione per diminuire la quantità di un prodotto nel carrello
  const decreaseQuantity = async (productId) => {
    try {
      //todo: Trova prodotto
      const product = cart.find(item => item.id === productId);
      if (!product) return;

      if (product.quantity === 1) {
        //todo: Se quantità è 1, rimuovi completamente
        await removeFromCart(productId);
      } else {
        //todo: Altrimenti diminuisci quantità
        await cartAPI.update(productId, product.quantity - 1);
        await loadCart();
      }
    } catch (error) {
      showNotification('Errore nell\'aggiornamento', 'error');
    }
  };

  //todo: Funzione per aumentare la quantità di un prodotto nel carrello

  const increaseQuantity = async (productId) => {
    try {
      const product = cart.find(item => item.id === productId);
      if (!product) return;

      await cartAPI.update(productId, product.quantity + 1);
      await loadCart();
    } catch (error) {
      showNotification('Errore nell\'aggiornamento', 'error');
    }
  };

  //todo: Funzione per svuotare completamente il carrello
  const clearCart = async () => {
    try {
      const itemCount = cart.length;
      
      if (itemCount === 0) {
        showNotification('Il carrello è già vuoto', 'info');
        return;
      }

      // Conferma prima di svuotare
      if (window.confirm(`Vuoi davvero svuotare il carrello? Verranno rimossi ${itemCount} prodotti.`)) {
        console.log('🗑️ Svuotamento carrello...');
        
        // Chiama l'API per svuotare il carrello nel backend
        await cartAPI.clear();
        
        // Ricarica il carrello per aggiornare lo stato
        await loadCart();
        
        showNotification(`Carrello svuotato! ${itemCount} prodotti rimossi.`, 'error');
      }
    } catch (error) {
      console.error('Errore svuotamento carrello:', error);
      showNotification('Errore nello svuotamento del carrello', 'error');
    }
  };

  //todo: Funzione per filtrare e ordinare prodotti
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    console.log('🔍 Filtri attivi:', filters);
    console.log('📦 Prodotti totali:', products.length);

    // Filtro per ricerca
    if (searchValue) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      console.log('🔎 Dopo ricerca:', filtered.length);
    }

    // Filtro per prezzo
    if (filters.priceRange) {

      filtered = filtered.filter(p => {
        const price = parseFloat(p.price) || 0;
        return price <= filters.priceRange.current;
      });
      console.log('💰 Dopo filtro prezzo (<=' + filters.priceRange.current + '):', filtered.length);
    }

    // Filtro per categorie
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.includes(p.category)
      );
      console.log('📂 Dopo filtro categorie:', filtered.length);
    }

    // Filtro per contenuti maggiorenni (+18)
    if (filters.matureContent) {
      console.log('🔞 Filtro maggiorenni attivo');
      filtered = filtered.filter(p => {
        const minAge = parseInt(p.min_age) || 0;
        return minAge >= 18;
      });
      console.log('🔞 Dopo filtro maggiorenni:', filtered.length);
    }

    // Filtro per prodotti in promozione (scontati)
    if (filters.onSale) {
      console.log('🏷️ Filtro scontati attivo');
      filtered = filtered.filter(p => {
        const discount = parseFloat(p.discount) || 0;
        return discount > 0;
      });
      console.log('🏷️ Dopo filtro scontati:', filtered.length);
    }

    console.log('✅ Prodotti finali:', filtered.length);

    // Ordinamento
    switch (sortValue) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return priceB - priceA;
        });
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
            {/* todo: Controlli per cambiare visualizzazione */}
            <div className="view-controls">
              <div style={{ display: 'flex', gap: '10px' }}>
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

            {loading ? (
              <div className="loading-container">
                <p>Caricamento prodotti...</p>
              </div>
            ) : (
              <>
                <div className={`products products-${viewMode}`}>
                  {getFilteredAndSortedProducts().slice(0, visibleProducts).map((p) => (
                    <ProductCard
                      key={p.id || p.name}
                      product={p}
                      variant={viewMode === "grid" ? "grid" : "compact"}
                      onViewDetails={(slug) => navigate(`/details/${slug}`)}
                      onAddToCart={addToCart}
                      showActions={true}
                    />
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
                subtotal={cart.reduce((sum, item) => {
                  const price = parseFloat(item.price) || 0;
                  return sum + (price * item.quantity);
                }, 0)}
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
                {cart.map((item) => {
                  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">{price.toFixed(2)}€</span>
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
                          {(price * item.quantity).toFixed(2)}€
                        </span>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Rimuovi
                        </button>
                      </div>
                    </div>

                  );
                })}

                {/* todo: Mostro totale del carrello */}
                <div className="cart-total">
                  <strong>
                    Totale Carretto: {cart.reduce((sum, item) => {
                      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                      return sum + (price * item.quantity);
                    }, 0).toFixed(2)}€
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
                  
                  {cart.map((item) => {
                    const price = parseFloat(item.price) || 0;
                    return (
                      <div key={item.id} className="checkout-item">
                        <div className="checkout-item-info">
                          <span className="checkout-item-name">{item.name}</span>
                          <span className="checkout-item-details">
                            {item.quantity} x {price.toFixed(2)}€
                          </span>
                        </div>
                        
                        <div className="checkout-item-actions">
                          <span className="checkout-item-total">
                            {(price * item.quantity).toFixed(2)}€
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
                    );
                  })}
                </div >

  {/* todo: Sezione per inserire il codice promozionale */ }
  < div className = "promo-code-section" >
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
{/*todo: Mostra messaggio di feedback solo se presente (successo in verde, errore in rosso)*/ }
{
  promoMessage && (
    <p className={`promo-message ${promoApplied ? 'success' : 'error'}`}>
      {promoMessage}
    </p>
  )
}
                </div >

  {/* todo: Totale ordine e bottoni azioni */ }
  < div className = "checkout-summary" >
    {/*todo: Calcoliamo i valori fuori dalla IIFE per usarli anche nelle azioni*/ }
{
  (() => {
    //todo: Calcoliamo il subtotale sommando prezzo × quantità di ogni prodotto
    const subtotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + (price * item.quantity);
    }, 0);
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
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>4.99€</span>
                  {' '}
                  <span style={{ color: '#4ade80' }}>GRATIS</span>
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
            onClick={clearCart}
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
  })()
}
                </div >
              </>
            )}
          </div >
        )}
      </main >

  {/* todo: Overlay form checkout */ }
{/* todo: Passiamo 4 props al CheckoutForm: totalAmount (con spedizione), cartItems, shippingCost e isFreeShipping */ }
{
  showCheckoutForm && (() => {
    const subtotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + (price * item.quantity);
    }, 0);
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
        /* Funzione per rimuovere prodotti dal carrello durante il checkout */
        onRemoveFromCart={removeFromCart}
      />
    );
  })()
}
    </div >
  );
};

//todo: Esporto il componente Shop così può essere usato in altre parti dell'app
export default Shop;
