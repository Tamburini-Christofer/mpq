// API BASE URL
const API_BASE_URL = 'http://localhost:3000';

// Genera o recupera session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// ===== PRODUCTS API =====

export const productsAPI = {
  // Ottieni tutti i prodotti
  getAll: async (categoryId = null) => {
    try {
      const url = categoryId 
        ? `${API_BASE_URL}/products?category_id=${categoryId}`
        : `${API_BASE_URL}/products`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Errore nel caricamento dei prodotti');
      return await response.json();
    } catch (error) {
      console.error('Errore API getAll:', error);
      throw error;
    }
  },

  // Ottieni prodotto per slug
  getBySlug: async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${slug}`);
      if (!response.ok) throw new Error('Prodotto non trovato');
      return await response.json();
    } catch (error) {
      console.error('Errore API getBySlug:', error);
      throw error;
    }
  }
};

// ===== CART API =====

export const cartAPI = {
  // Ottieni carrello
  get: async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
      if (!response.ok) throw new Error('Errore nel caricamento del carrello');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.get:', error);
      return [];
    }
  },

  // Aggiungi al carrello
  add: async (productId, quantity = 1) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (!response.ok) throw new Error('Errore nell\'aggiunta al carrello');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.add:', error);
      throw error;
    }
  },

  // Aggiorna quantità
  update: async (productId, quantity) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (!response.ok) throw new Error('Errore nell\'aggiornamento');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.update:', error);
      throw error;
    }
  },

  // Rimuovi dal carrello
  remove: async (productId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Errore nella rimozione');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.remove:', error);
      throw error;
    }
  },

  // Svuota carrello
  clear: async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Errore nello svuotamento');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.clear:', error);
      throw error;
    }
  }
};

// ===== CHECKOUT API =====

export const checkoutAPI = {
  // Crea ordine
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Errore nella creazione dell\'ordine');
      return await response.json();
    } catch (error) {
      console.error('Errore API checkout.createOrder:', error);
      throw error;
    }
  },

  // Ottieni ordine
  getOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/orders/${orderId}`);
      if (!response.ok) throw new Error('Ordine non trovato');
      return await response.json();
    } catch (error) {
      console.error('Errore API checkout.getOrder:', error);
      throw error;
    }
  },

  // Ottieni ordini utente
  getUserOrders: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/user/${encodeURIComponent(email)}/orders`);
      if (!response.ok) throw new Error('Errore nel caricamento degli ordini');
      return await response.json();
    } catch (error) {
      console.error('Errore API checkout.getUserOrders:', error);
      throw error;
    }
  }
};

// Evento personalizzato per sincronizzare il carrello tra componenti
export const emitCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('cartUpdate'));
};
