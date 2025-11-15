//todo: Importiamo React e useState per creare componenti e gestire stati
import React, { useState } from "react";

//todo: Importiamo il CSS del componente Shop per lo stile
import "./ShopComponent.css"; 

//todo: Creo il componente principale Shop
const Shop = () => {
  //todo: Stato per sapere quale tab è attivo (Shop, Carrello o Checkout)
  const [activeTab, setActiveTab] = useState("shop");

  //todo: Lista di prodotti disponibili nello shop (sono degli esempi)
  const products = [
    { id: 1, name: "The Lord Of the Ring", price: 4.99 },
    { id: 2, name: "Stranger Things", price: 9.99 },
    { id: 3, name: "Harry Potter Collection", price: 69.99 },
    { id: 4, name: "Anime Collection", price: 69.99 },
    { id: 4, name: "Football", price: 19.99 },
    { id: 4, name: "Gigina la dinosaura", price: 19.99 },
    { id: 4, name: "Samir Experience", price: 29.99 },
    { id: 4, name: "El Trentin", price: 39.99 },
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
      <aside className="sidebar">
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

      {/* todo: Contenuto principale */}
      <main className="content">
        {/* todo: Sezione Shop */}
        {activeTab === "shop" && (
          <div className="shop-section">

            <div className="products">
              {products.map((p) => (
                <div key={p.id} className="card">
                  <h3>{p.name}</h3>
                  <p className="price">{p.price.toFixed(2)}€</p>
                  <button className="buy-btn" onClick={() => addToCart(p)}>
                    Aggiungi
                  </button>
                </div>
              ))}
            </div>
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
                    <button className="confirm-btn">
                      Conferma Acquisto e parti per la tua prossima avventura
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

//todo: Esporto il componente Shop così può essere usato in altre parti dell'app
export default Shop;
