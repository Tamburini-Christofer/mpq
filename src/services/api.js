// API BASE URL
const API_BASE_URL = 'http://localhost:3000';

// Genera o recupera session ID (persistente in localStorage per tab/finestre)
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Legge eventuale parametro `cart` dalla querystring, decodifica da Base64 JSON
const readCartParam = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('cart');
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const items = JSON.parse(json);
    if (Array.isArray(items)) return items;
  } catch (e) {
    console.warn('Errore parsing cart param:', e);
  }
  return null;
};

// Applica il cart dalla querystring al carrello server per la sessione corrente.
// Questa operazione viene eseguita solo una volta per sessione (flag in localStorage).
const applyCartFromUrlIfPresent = async () => {
  try {
    if (localStorage.getItem('cartFromUrlApplied') === '1') return;
    const items = readCartParam();
    if (!items || items.length === 0) return;

    localStorage.setItem('cartFromUrlApplied', '1');

    const sessionId = getSessionId();
    console.log('Applying shared cart to session', sessionId, items);

    // Svuota il carrello corrente (ignora errori)
    try { await fetch(`${API_BASE_URL}/cart/${sessionId}`, { method: 'DELETE' }); } catch (e) { /* ignore */ }

    // Aggiungi tutti gli item al server
    for (const it of items) {
      const productId = it.productId ?? it.id ?? it.product_id;
      const quantity = it.quantity ?? 1;
      if (!productId) continue;
      try {
        await fetch(`${API_BASE_URL}/cart/${sessionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity })
        });
      } catch (e) {
        console.warn('Errore aggiunta item shared cart:', e);
      }
    }

    // Rimuovi il parametro `cart` dall'URL per non riapplicarlo
    const url = new URL(window.location.href);
    url.searchParams.delete('cart');
    window.history.replaceState({}, document.title, url.toString());
  } catch (e) {
    console.error('applyCartFromUrlIfPresent error', e);
  }
};

// ===== PRODUCTS API =====

export const productsAPI = {
  // Ottieni tutti i prodotti con paginazione
  getAll: async (options = {}) => {
    try {
      const {
        categoryId = null,
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'recent',
        priceMin = null,
        priceMax = null,
        onSale = false,
        matureContent = false,
        accessibility = false
      } = options;

      const params = new URLSearchParams();
      
      if (categoryId) params.append('category_id', categoryId);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) params.append('search', search.trim());
      params.append('sortBy', sortBy);
      if (priceMin !== null) params.append('priceMin', priceMin.toString());
      if (priceMax !== null) params.append('priceMax', priceMax.toString());
      if (onSale) params.append('onSale', 'true');
      if (matureContent) params.append('matureContent', 'true');
      if (accessibility) params.append('accessibility', 'true');

      const url = `${API_BASE_URL}/products?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Errore nel caricamento dei prodotti');
      return await response.json();
    } catch (error) {
      console.error('Errore API getAll:', error);
      throw error;
    }
  },

  // Ottieni tutti i prodotti senza paginazione (per compatibilità)
  getAllUnpaginated: async (categoryId = null) => {
    try {
      const url = categoryId 
        ? `${API_BASE_URL}/products?category_id=${categoryId}&limit=1000`
        : `${API_BASE_URL}/products?limit=1000`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Errore nel caricamento dei prodotti');
      const result = await response.json();
      return result.products || result; // Gestisce sia il nuovo formato che il vecchio
    } catch (error) {
      console.error('Errore API getAllUnpaginated:', error);
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
    console.log('API: cartAPI.get() called.');
    try {
      // Se l'URL contiene un carrello condiviso, applicalo una volta per la sessione
      await applyCartFromUrlIfPresent();
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
      if (!response.ok) throw new Error('Errore nel caricamento del carrello');
      const data = await response.json();
      console.log('API: cartAPI.get() response data:', data);
      return data;
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

  // Aumenta quantità
  increase: async (productId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}/increase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Errore nell\'aumento della quantità');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.increase:', error);
      throw error;
    }
  },

  // Diminuisci quantità
  decrease: async (productId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/items/${productId}/decrease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Errore nella diminuzione della quantità');
      return await response.json();
    } catch (error) {
      console.error('Errore API cart.decrease:', error);
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
  console.log('API: emitCartUpdate() called, dispatching CustomEvent "cartUpdate".');
  window.dispatchEvent(new CustomEvent('cartUpdate'));
};
